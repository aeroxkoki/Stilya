"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var Tags = function (_a) {
    var tags = _a.tags, _b = _a.size, size = _b === void 0 ? 'medium' : _b, _c = _a.color, color = _c === void 0 ? 'white' : _c, _d = _a.backgroundColor, backgroundColor = _d === void 0 ? 'rgba(59, 130, 246, 0.8)' : _d, // #3B82F6 with opacity
    onPressTag = _a.onPressTag, _e = _a.scrollable, scrollable = _e === void 0 ? true : _e, _f = _a.maxTags, maxTags = _f === void 0 ? 5 : _f;
    if (!tags || tags.length === 0) {
        return null;
    }
    // サイズに応じたスタイルを選択
    var sizeStyles = {
        small: {
            text: styles.smallText,
            tag: styles.smallTag,
        },
        medium: {
            text: styles.mediumText,
            tag: styles.mediumTag,
        },
        large: {
            text: styles.largeText,
            tag: styles.largeTag,
        },
    };
    // 色指定を適用
    var colorStyle = {
        color: color,
    };
    // 背景色指定を適用
    var backgroundColorStyle = {
        backgroundColor: backgroundColor,
    };
    // 表示するタグを制限
    var visibleTags = maxTags > 0 ? tags.slice(0, maxTags) : tags;
    var hiddenTagsCount = maxTags > 0 ? Math.max(0, tags.length - maxTags) : 0;
    // タグコンポーネント
    var TagComponent = function (_a) {
        var tag = _a.tag;
        return (<react_native_1.View style={[sizeStyles[size].tag, backgroundColorStyle]} key={tag}>
      <react_native_1.Text style={[sizeStyles[size].text, colorStyle]} numberOfLines={1}>
        {tag}
      </react_native_1.Text>
    </react_native_1.View>);
    };
    // コンテンツ
    var content = (<>
      {visibleTags.map(function (tag) { return (<TagComponent tag={tag} key={tag}/>); })}
      
      {hiddenTagsCount > 0 && (<react_native_1.View style={[sizeStyles[size].tag, styles.moreTag]}>
          <react_native_1.Text style={[sizeStyles[size].text, styles.moreTagText]}>
            +{hiddenTagsCount}
          </react_native_1.Text>
        </react_native_1.View>)}
    </>);
    // スクロール可能かどうかで表示方法を変える
    if (scrollable) {
        return (<react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {content}
      </react_native_1.ScrollView>);
    }
    return <react_native_1.View style={styles.container}>{content}</react_native_1.View>;
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    scrollContainer: {
        flexDirection: 'row',
        paddingVertical: 4,
    },
    smallTag: {
        borderRadius: 4,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 4,
        marginBottom: 4,
    },
    mediumTag: {
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 6,
        marginBottom: 6,
    },
    largeTag: {
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
        marginBottom: 8,
    },
    smallText: {
        fontSize: 10,
        fontWeight: '500',
    },
    mediumText: {
        fontSize: 12,
        fontWeight: '500',
    },
    largeText: {
        fontSize: 14,
        fontWeight: '500',
    },
    moreTag: {
        backgroundColor: 'rgba(107, 114, 128, 0.8)', // #6B7280 with opacity
    },
    moreTagText: {
        color: 'white',
    },
});
exports.default = Tags;
