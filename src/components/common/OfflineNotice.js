"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var NetworkContext_1 = require("@/contexts/NetworkContext");
/**
 * オフライン状態を表示するバナーコンポーネント
 */
var OfflineNotice = function () {
    var _a = (0, NetworkContext_1.useNetwork)(), isConnected = _a.isConnected, lastSync = _a.lastSync;
    var slideAnim = (0, react_1.useState)(new react_native_1.Animated.Value(-100))[0]; // 初期位置は画面外
    // 接続状態によってアニメーションを制御
    (0, react_1.useEffect)(function () {
        if (isConnected === false) {
            // オフラインになった場合、バナーを表示
            react_native_1.Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }).start();
        }
        else if (isConnected === true) {
            // オンラインに戻った場合、バナーを非表示
            react_native_1.Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isConnected]);
    // 最後の同期情報を表示
    var getLastSyncText = function () {
        if (!lastSync)
            return '';
        var now = new Date();
        var syncTime = new Date(lastSync);
        var diffMs = now.getTime() - syncTime.getTime();
        var diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) {
            return 'たった今同期されました';
        }
        else if (diffMins < 60) {
            return "".concat(diffMins, "\u5206\u524D\u306B\u540C\u671F\u3055\u308C\u307E\u3057\u305F");
        }
        else {
            var diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) {
                return "".concat(diffHours, "\u6642\u9593\u524D\u306B\u540C\u671F\u3055\u308C\u307E\u3057\u305F");
            }
            else {
                var diffDays = Math.floor(diffHours / 24);
                return "".concat(diffDays, "\u65E5\u524D\u306B\u540C\u671F\u3055\u308C\u307E\u3057\u305F");
            }
        }
    };
    // オフライン時のみ表示
    if (isConnected !== false) {
        return null;
    }
    return (<react_native_1.Animated.View style={[
            styles.container,
            {
                transform: [{ translateY: slideAnim }],
            },
        ]} testID="offline-notice">
      <react_native_1.View style={styles.contentContainer}>
        <vector_icons_1.Ionicons name="cloud-offline" size={20} color="#F57C00" style={styles.icon}/>
        <react_native_1.View>
          <react_native_1.Text style={styles.title}>オフラインモード</react_native_1.Text>
          <react_native_1.Text style={styles.message}>
            インターネットに接続されていません。一部の機能が制限されます。
          </react_native_1.Text>
          {lastSync && (<react_native_1.Text style={styles.syncInfo}>{getLastSyncText()}</react_native_1.Text>)}
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFF8E1',
        paddingTop: 45, // ステータスバーの高さを考慮
        paddingBottom: .16,
        paddingHorizontal: 16,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 4,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    icon: {
        marginRight: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F57C00',
    },
    message: {
        fontSize: 12,
        color: '#555',
        marginTop: 2,
    },
    syncInfo: {
        fontSize: 10,
        color: '#888',
        marginTop: 4,
        fontStyle: 'italic',
    },
});
exports.default = OfflineNotice;
