#!/usr/bin/env python3
"""
Train Models with Current Data

Attempts to train models with available data, even if enhanced features are sparse.
Will use enhanced features where available, fallback to basic features otherwise.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.feature_engineering import GasFeatureEngineer
from models.model_trainer import GasModelTrainer


def main():
    print("="*70)
    print("🎯 Training Models with Current Data + Week 1 Quick Wins")
    print("="*70)
    
    print("\n📊 Week 1 Quick Wins being used:")
    print("  ✅ 1-minute sampling (COLLECTION_INTERVAL = 60s)")
    print("  ✅ Enhanced congestion features (where available)")
    print("  ✅ RobustScaler (outlier handling)")
    
    # Step 1: Prepare data
    print("\n📊 Step 1: Preparing training data...")
    engineer = GasFeatureEngineer()
    
    try:
        # Try with 30 days of data
        df = engineer.prepare_training_data(hours_back=720)
        
        if len(df) == 0:
            print("❌ No training samples generated")
            print("💡 This usually means:")
            print("   - Not enough onchain_features data yet")
            print("   - Or lag features removed all rows")
            print("\n💡 Options:")
            print("   1. Wait for more data collection (run check_collection_status.py)")
            print("   2. Continue collection in background")
            return False
        
        print(f"✅ Prepared {len(df)} training samples")
        print(f"   Total features: {len(df.columns)}")
        
        # Check enhanced features
        enhanced_features = [
            'pending_tx_count', 'unique_addresses', 'tx_per_second',
            'gas_utilization_ratio', 'congestion_level', 'is_highly_congested'
        ]
        found = [f for f in enhanced_features if f in df.columns]
        if found:
            non_null_counts = {f: df[f].notna().sum() for f in found}
            print(f"\n📊 Enhanced features status:")
            for feat, count in non_null_counts.items():
                pct = (count / len(df) * 100) if len(df) > 0 else 0
                print(f"   {feat}: {count}/{len(df)} ({pct:.1f}%)")
        
    except ValueError as e:
        print(f"❌ Error: {e}")
        print("\n💡 Solutions:")
        print("   1. Wait for more data collection")
        print("   2. Check data collection status: python3 scripts/check_collection_status.py")
        return False
    
    # Step 2: Extract features and targets
    print("\n📊 Step 2: Extracting features and targets...")
    feature_cols = engineer.get_feature_columns(df)
    X = df[feature_cols]
    y_1h = df['target_1h'].dropna()
    y_4h = df['target_4h'].dropna()
    y_24h = df['target_24h'].dropna()
    
    print(f"   Features: {len(feature_cols)}")
    print(f"   Samples (1h): {len(y_1h)}")
    print(f"   Samples (4h): {len(y_4h)}")
    print(f"   Samples (24h): {len(y_24h)}")
    
    if len(y_1h) < 50:
        print(f"\n⚠️  Warning: Only {len(y_1h)} samples for 1h horizon")
        print("   Models may have limited accuracy")
        response = input("   Continue anyway? (y/n): ")
        if response.lower() != 'y':
            return False
    
    # Step 3: Train models
    print("\n📊 Step 3: Training models with RobustScaler...")
    print("   (This may take a few minutes)")
    
    trainer = GasModelTrainer()
    
    # Use the standard training method which handles all horizons
    results = trainer.train_all_models(X, y_1h, y_4h, y_24h)
    
    if not results:
        print("❌ Not enough data to train any models")
        return False
    
    # Step 4: Save models
    print("\n📊 Step 4: Saving models...")
    trainer.save_models()
    
    print("\n" + "="*70)
    print("✅ Training Complete!")
    print("="*70)
    
    # Print summary
    print("\n📊 Model Performance Summary:")
    for horizon, result in results.items():
        best = result['best']
        print(f"\n{horizon}:")
        print(f"  Model: {best['name']}")
        print(f"  MAE: {best['metrics']['mae']:.6f} gwei")
        print(f"  RMSE: {best['metrics']['rmse']:.6f} gwei")
        print(f"  R²: {best['metrics']['r2']:.4f}")
        print(f"  Directional Accuracy: {best['metrics']['directional_accuracy']*100:.1f}%")
    
    print("\n" + "="*70)
    print("📋 Next Steps:")
    print("="*70)
    print("1. Run backtest to compare with baseline:")
    print("   python3 testing/backtest_current_models.py")
    print("\n2. Continue collecting enhanced features for better accuracy")
    print("   (Models will improve as more enhanced features are collected)")
    print("\n3. Retrain again in a few hours when more data is available")
    
    return True


if __name__ == '__main__':
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
