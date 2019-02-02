## Running the app

1. To test on your own device, download Expo Client from the App Store/Google Play Store. You can also use an emulator but I've found it pretty easy to use an actual device.
2. Cd into the gtfo directory and run ```expo start```. A QR code should come up.
3. Open the Expo app (for Android) or the Camera app (for iOS) and scan the QR code. The app should begin to build and open shortly.
4. The app should rebuild automatically if you save/update any files.

### Structure
1. ```App.js```: You'll only need to update this if you need to load any additional assets to store on client.
#### Navigation folder
Holds all the navigators. These consist of screens or navigators nested within them that you can switch between by calling ```this.props.navigation.navigate(SCREEN)```. The file we'll probably update most often is ```MainTabNavigator.js```, which is a bottom tab navigator (as it sounds) consisting of a home and settings stack. 
1. ```AppNavigator.js```: Shouldn't really need to modify this. Splits the app into the authentication flow and core app.
2. ```MainTabNavigator.js```: If you need to add a screen to the core app flow, add it to the HomeStack here.
#### Screens folder
All the screens. Most are as their name sounds. You can navigate between other screens within the same navigator as mentioned above. If you need any additional custom components, you can add them to the components foler.

#### Fetch
1. ```FetchWrapper.js```: wrapper for server calls. Any global state needed within the app should be managed through redux.
