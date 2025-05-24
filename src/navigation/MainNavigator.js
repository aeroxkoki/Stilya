"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var bottom_tabs_1 = require("@react-navigation/bottom-tabs");
var vector_icons_1 = require("@expo/vector-icons");
// ナビゲーター
var SwipeNavigator_1 = __importDefault(require("./SwipeNavigator"));
var RecommendNavigator_1 = __importDefault(require("./RecommendNavigator"));
var ProfileScreen_1 = __importDefault(require("@/screens/profile/ProfileScreen"));
var DevNavigator_1 = __importDefault(require("./DevNavigator"));
var ReportNavigator_1 = __importDefault(require("./ReportNavigator"));
var Tab = (0, bottom_tabs_1.createBottomTabNavigator)();
var MainNavigator = function () {
    return (<Tab.Navigator screenOptions={function (_a) {
            var route = _a.route;
            return ({
                headerShown: false,
                tabBarIcon: function (_a) {
                    var focused = _a.focused, color = _a.color, size = _a.size;
                    var iconName;
                    if (route.name === 'Swipe') {
                        iconName = focused ? 'card' : 'card-outline';
                    }
                    else if (route.name === 'Recommend') {
                        iconName = focused ? 'star' : 'star-outline';
                    }
                    else if (route.name === 'Report') {
                        iconName = focused ? 'bar-chart' : 'bar-chart-outline';
                    }
                    else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }
                    else if (route.name === 'Dev') {
                        iconName = focused ? 'code-working' : 'code-outline';
                    }
                    else {
                        iconName = 'help-circle';
                    }
                    return <vector_icons_1.Ionicons name={iconName} size={size} color={color}/>;
                },
                tabBarActiveTintColor: '#3B82F6',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    paddingBottom: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            });
        }}>
      <Tab.Screen name="Swipe" component={SwipeNavigator_1.default} options={{ title: 'スワイプ' }}/>
      <Tab.Screen name="Recommend" component={RecommendNavigator_1.default} options={{ title: 'おすすめ' }}/>
      <Tab.Screen name="Report" component={ReportNavigator_1.default} options={{ title: 'レポート' }}/>
      <Tab.Screen name="Profile" component={ProfileScreen_1.default} options={{ title: 'マイページ' }}/>
      <Tab.Screen name="Dev" component={DevNavigator_1.default} options={{
            title: '開発ツール',
            tabBarStyle: {
                paddingBottom: 5,
                height: 60,
                display: __DEV__ ? 'flex' : 'none'
            }
        }}/>
    </Tab.Navigator>);
};
exports.default = MainNavigator;
