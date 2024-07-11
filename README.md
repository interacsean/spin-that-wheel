# Script to add in Spotify tab:

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
