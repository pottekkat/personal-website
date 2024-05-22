var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

if (!isSafari) {
  console.log(
    "\r\n   _  __                      __       ___       __  __      __    __        __ \r\n  / |/ /__ __  _____ ___  ___/ /_ __  / _ \\___  / /_/ /____ / /__ / /_____ _/ /_\r\n /    / _ `/ |/ / -_) _ \\/ _  / // / / ___/ _ \\/ __/ __/ -_)  '_//  '_/ _ `/ __/\r\n/_/|_/\\_,_/|___/\\__/_//_/\\_,_/\\_,_/ /_/   \\___/\\__/\\__/\\__/_/\\_\\/_/\\_\\\\_,_/\\__/\n\nhttps://github.com/pottekkat/personal-website"
  );
} else {
  console.log(
    "I hate Safari. I had cool ASCII art here, but Safari isn't cool enough to display it correctly.\n\nNavendu Pottekkat\n\nhttps://github.com/pottekkat/personal-website"
  );
}
