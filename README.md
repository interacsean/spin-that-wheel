# Spin that Wheel!

Application for Comedy Roulette live comedy night

The app uses keyboard shortcuts to navigate and control the wheel.  See the Settings page of the app for details

*Playing music from Spotify uses a cross-tab hack...

 - Open settings and click the 'Open Spotify controlled tab' button to open a Spotify tab
   - Note this doesn't work from an iframe such as the windowed version of StackBlitz
 - Copy and paste the below javascript into the Dev Tools console of that tab
 - The `p` button will now toggle play/pause for whatever is on that tab

```
window.addEventListener('message', function(event) {
    const message = event.data;
    if (message === 'wheel_toggleMusic') {
        console.log({ event });
        document.querySelector('[data-testid="control-button-playpause"]').click()
        console.log('Received play command');
    }
});
```

There is formative code for using the Spotify API, if the active user has a paid Pro account, which can be enabled with some minimal further work
