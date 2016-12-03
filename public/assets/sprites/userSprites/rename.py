import os

print os.listdir("C:/Users/Roger Liu/Desktop/TwitchLounge/public/assets/sprites/userSprites/")
for f in os.listdir("C:/Users/Roger Liu/Desktop/TwitchLounge/public/assets/sprites/userSprites/"):
    fnew = f.replace(")", "")
    fnew = f.replace(" (", "_")
    os.rename(f, fnew)