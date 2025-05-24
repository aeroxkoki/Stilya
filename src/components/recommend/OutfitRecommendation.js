"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var OutfitRecommendation = function (_a) {
    var outfit = _a.outfit, onPress = _a.onPress, _b = _a.layout, layout = _b === void 0 ? 'card' : _b, style = _a.style;
    var top = outfit.top, bottom = outfit.bottom, outerwear = outfit.outerwear, accessories = outfit.accessories;
    // コーディネートが無効な場合は表示しない
    if (!top && !bottom) {
        return null;
    }
    // アイテムのURL取得ヘルパー
    var getImage = function (product) {
        if (!product)
            return '';
        // ここでimageUrlかimage_urlの区別をしておく
        return product.imageUrl || product.image_url || '';
    };
    // コーディネートの合計金額を計算
    var getTotalPrice = function () {
        var total = 0;
        if (top)
            total += top.price;
        if (bottom)
            total += bottom.price;
        if (outerwear)
            total += outerwear.price;
        if (accessories)
            total += accessories.price;
        return total;
    };
    // コーディネートの説明文を生成
    var getOutfitDescription = function () {
        var items = [];
        if (top)
            items.push(top.brand || 'ブランド');
        if (bottom)
            items.push(bottom.brand || 'ブランド');
        return "".concat(items.join(' × '), " \u30B3\u30FC\u30C7\u30A3\u30CD\u30FC\u30C8");
    };
    // コーディネートのアイテム数を取得
    var getItemCount = function () {
        var count = 0;
        if (top)
            count++;
        if (bottom)
            count++;
        if (outerwear)
            count++;
        if (accessories)
            count++;
        return count;
    };
    // カードレイアウト用のレンダリング
    if (layout === 'card') {
        return (<react_native_1.TouchableOpacity style={[styles.cardContainer, style]} onPress={onPress} activeOpacity={0.8}>
        <react_native_1.View style={styles.cardImages}>
          {/* メインアイテム */}
          <react_native_1.View style={styles.mainImageContainer}>
            <react_native_1.Image source={{ uri: getImage(top) || getImage(bottom) }} style={styles.mainImage} resizeMode="cover"/>
          </react_native_1.View>
          
          {/* サブアイテム */}
          <react_native_1.View style={styles.subImagesContainer}>
            {bottom && top && (<react_native_1.Image source={{ uri: getImage(bottom) }} style={styles.subImage} resizeMode="cover"/>)}
            
            {outerwear && (<react_native_1.Image source={{ uri: getImage(outerwear) }} style={styles.subImage} resizeMode="cover"/>)}
            
            {accessories && (<react_native_1.Image source={{ uri: getImage(accessories) }} style={styles.subImage} resizeMode="cover"/>)}
            
            {/* アイテムが3つ未満の場合、空のプレースホルダーで埋める */}
            {getItemCount() < 3 && (<react_native_1.View style={[styles.subImage, styles.placeholderItem]}>
                <vector_icons_1.Ionicons name="add-outline" size={24} color="#9CA3AF"/>
              </react_native_1.View>)}
          </react_native_1.View>
        </react_native_1.View>
        
        <react_native_1.View style={styles.cardInfo}>
          <react_native_1.Text style={styles.outfitTitle}>コーディネート</react_native_1.Text>
          <react_native_1.Text style={styles.outfitItemsCount}>{getItemCount()}点のアイテム</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.TouchableOpacity>);
    }
    // フルレイアウト用のレンダリング
    return (<react_native_1.TouchableOpacity style={[styles.fullContainer, style]} onPress={onPress} activeOpacity={0.8}>
      <react_native_1.View style={styles.fullImages}>
        {/* 左側にメインアイテム */}
        <react_native_1.View style={styles.fullMainImageContainer}>
          <react_native_1.Image source={{ uri: getImage(top) || getImage(bottom) }} style={styles.fullMainImage} resizeMode="cover"/>
        </react_native_1.View>
        
        {/* 右側にその他アイテム */}
        <react_native_1.View style={styles.fullSubImagesContainer}>
          {bottom && top && (<react_native_1.Image source={{ uri: getImage(bottom) }} style={styles.fullSubImage} resizeMode="cover"/>)}
          
          {outerwear && (<react_native_1.Image source={{ uri: getImage(outerwear) }} style={styles.fullSubImage} resizeMode="cover"/>)}
          
          {accessories && (<react_native_1.Image source={{ uri: getImage(accessories) }} style={styles.fullSubImage} resizeMode="cover"/>)}
        </react_native_1.View>
      </react_native_1.View>
      
      <react_native_1.View style={styles.fullInfo}>
        <react_native_1.View>
          <react_native_1.Text style={styles.fullOutfitTitle}>コーディネート</react_native_1.Text>
          <react_native_1.Text style={styles.fullOutfitDescription}>
            {getOutfitDescription()}
          </react_native_1.Text>
        </react_native_1.View>
        
        <react_native_1.View style={styles.fullPriceContainer}>
          <react_native_1.Text style={styles.fullPriceLabel}>合計</react_native_1.Text>
          <react_native_1.Text style={styles.fullPrice}>¥{getTotalPrice().toLocaleString()}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.TouchableOpacity>);
};
var styles = react_native_1.StyleSheet.create({
    // カードレイアウトのスタイル
    cardContainer: {
        width: 240,
        height: 280,
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        marginRight: 16,
    },
    cardImages: {
        height: 220,
        flexDirection: 'row',
    },
    mainImageContainer: {
        flex: 2,
    },
    mainImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    subImagesContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    subImage: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    placeholderItem: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F3F4F6',
    },
    cardInfo: {
        padding: 12,
    },
    outfitTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
    },
    outfitItemsCount: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    // フルレイアウトのスタイル
    fullContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    fullImages: {
        height: 200,
        flexDirection: 'row',
    },
    fullMainImageContainer: {
        flex: 2,
    },
    fullMainImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f5f5f5',
    },
    fullSubImagesContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    fullSubImage: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    fullInfo: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    fullOutfitTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    fullOutfitDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 4,
    },
    fullPriceContainer: {
        alignItems: 'flex-end',
    },
    fullPriceLabel: {
        fontSize: 12,
        color: '#6B7280',
    },
    fullPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 2,
    },
});
exports.default = OutfitRecommendation;
