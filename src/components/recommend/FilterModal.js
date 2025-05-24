"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var common_1 = require("@/components/common");
// カテゴリーの表示名マッピング
var CATEGORY_LABELS = {
    'tops': 'トップス',
    'bottoms': 'ボトムス',
    'outerwear': 'アウター',
    'accessories': 'アクセサリー',
    'shoes': 'シューズ',
    'bags': 'バッグ',
    'dresses': 'ワンピース',
    'sets': 'セットアップ'
};
// 利用可能なカテゴリー
var AVAILABLE_CATEGORIES = [
    'tops', 'bottoms', 'outerwear', 'accessories', 'shoes', 'bags', 'dresses', 'sets'
];
// 価格帯の選択肢
var PRICE_RANGES = [
    [0, 3000],
    [3000, 5000],
    [5000, 10000],
    [10000, 20000],
    [20000, Infinity]
];
var FilterModal = function (_a) {
    var visible = _a.visible, onClose = _a.onClose, onApply = _a.onApply, initialFilters = _a.initialFilters, availableTags = _a.availableTags;
    // フィルター状態
    var _b = (0, react_1.useState)(initialFilters || {
        categories: [],
        priceRange: [0, Infinity],
        selectedTags: []
    }), filters = _b[0], setFilters = _b[1];
    // カテゴリー選択の切り替え
    var toggleCategory = function (category) {
        setFilters(function (prev) {
            if (prev.categories.includes(category)) {
                return __assign(__assign({}, prev), { categories: prev.categories.filter(function (c) { return c !== category; }) });
            }
            else {
                return __assign(__assign({}, prev), { categories: __spreadArray(__spreadArray([], prev.categories, true), [category], false) });
            }
        });
    };
    // 価格帯選択
    var selectPriceRange = function (range) {
        setFilters(function (prev) { return (__assign(__assign({}, prev), { priceRange: range })); });
    };
    // タグ選択の切り替え
    var toggleTag = function (tag) {
        setFilters(function (prev) {
            if (prev.selectedTags.includes(tag)) {
                return __assign(__assign({}, prev), { selectedTags: prev.selectedTags.filter(function (t) { return t !== tag; }) });
            }
            else {
                return __assign(__assign({}, prev), { selectedTags: __spreadArray(__spreadArray([], prev.selectedTags, true), [tag], false) });
            }
        });
    };
    // フィルターのリセット
    var resetFilters = function () {
        setFilters({
            categories: [],
            priceRange: [0, Infinity],
            selectedTags: []
        });
    };
    // フィルターの適用
    var applyFilters = function () {
        onApply(filters);
        onClose();
    };
    // 価格帯の表示テキスト
    var getPriceRangeText = function (range) {
        if (range[1] === Infinity) {
            return "".concat(range[0].toLocaleString(), "\u5186\u4EE5\u4E0A");
        }
        return "".concat(range[0].toLocaleString(), "\u5186 \u301C ").concat(range[1].toLocaleString(), "\u5186");
    };
    return (<react_native_1.Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <react_native_1.View style={styles.modalOverlay}>
        <react_native_1.View style={styles.modalContent}>
          {/* ヘッダー */}
          <react_native_1.View style={styles.modalHeader}>
            <react_native_1.Text style={styles.modalTitle}>フィルター</react_native_1.Text>
            <react_native_1.TouchableOpacity onPress={onClose}>
              <vector_icons_1.Ionicons name="close" size={24} color="#000"/>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>
          
          <react_native_1.ScrollView style={styles.scrollContent}>
            {/* カテゴリーセクション */}
            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>カテゴリー</react_native_1.Text>
              <react_native_1.View style={styles.tagContainer}>
                {AVAILABLE_CATEGORIES.map(function (category) { return (<react_native_1.TouchableOpacity key={category} style={[
                styles.tagButton,
                filters.categories.includes(category) ? styles.tagActive : styles.tagInactive
            ]} onPress={function () { return toggleCategory(category); }}>
                    <react_native_1.Text style={filters.categories.includes(category) ? styles.tagTextActive : styles.tagTextInactive}>
                      {CATEGORY_LABELS[category] || category}
                    </react_native_1.Text>
                  </react_native_1.TouchableOpacity>); })}
              </react_native_1.View>
            </react_native_1.View>
            
            {/* 価格帯セクション */}
            <react_native_1.View style={styles.section}>
              <react_native_1.Text style={styles.sectionTitle}>価格帯</react_native_1.Text>
              <react_native_1.View>
                {PRICE_RANGES.map(function (range, index) { return (<react_native_1.TouchableOpacity key={index} style={[
                styles.priceButton,
                filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1]
                    ? styles.priceActive : styles.priceInactive
            ]} onPress={function () { return selectPriceRange(range); }}>
                    <react_native_1.Text style={filters.priceRange[0] === range[0] && filters.priceRange[1] === range[1]
                ? styles.priceTextActive
                : styles.priceTextInactive}>
                      {getPriceRangeText(range)}
                    </react_native_1.Text>
                  </react_native_1.TouchableOpacity>); })}
              </react_native_1.View>
            </react_native_1.View>
            
            {/* タグセクション */}
            {availableTags.length > 0 && (<react_native_1.View style={styles.section}>
                <react_native_1.Text style={styles.sectionTitle}>スタイル・特徴</react_native_1.Text>
                <react_native_1.View style={styles.tagContainer}>
                  {availableTags.map(function (tag) { return (<react_native_1.TouchableOpacity key={tag} style={[
                    styles.styleTags,
                    filters.selectedTags.includes(tag) ? styles.tagActive : styles.tagInactive
                ]} onPress={function () { return toggleTag(tag); }}>
                      <react_native_1.Text style={[
                    filters.selectedTags.includes(tag) ? styles.tagTextActive : styles.tagTextInactive,
                    styles.smallText
                ]}>
                        {tag}
                      </react_native_1.Text>
                    </react_native_1.TouchableOpacity>); })}
                </react_native_1.View>
              </react_native_1.View>)}
          </react_native_1.ScrollView>
          
          {/* ボタン部分 */}
          <react_native_1.View style={styles.buttonContainer}>
            <react_native_1.TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <react_native_1.Text style={styles.resetButtonText}>リセット</react_native_1.Text>
            </react_native_1.TouchableOpacity>
            <common_1.Button style={styles.applyButton} onPress={applyFilters}>
              <react_native_1.Text style={styles.applyButtonText}>適用する</react_native_1.Text>
            </common_1.Button>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Modal>);
};
var styles = react_native_1.StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '60%',
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    tagContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tagButton: {
        margin: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
    },
    styleTags: {
        margin: 4,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
    },
    tagActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    tagInactive: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
    },
    tagTextActive: {
        color: 'white',
    },
    tagTextInactive: {
        color: '#333333',
    },
    smallText: {
        fontSize: 14,
    },
    priceButton: {
        marginBottom: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    priceActive: {
        backgroundColor: '#ebf5ff',
        borderColor: '#93c5fd',
    },
    priceInactive: {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
    },
    priceTextActive: {
        color: '#1d4ed8',
    },
    priceTextInactive: {
        color: '#333333',
    },
    buttonContainer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    resetButton: {
        flex: 1,
        marginRight: 8,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#4b5563',
        fontWeight: '500',
    },
    applyButton: {
        flex: 1,
        backgroundColor: '#2563eb',
    },
    applyButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
exports.default = FilterModal;
