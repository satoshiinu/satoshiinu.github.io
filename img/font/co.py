import shutil


for i in range(255):
    print(i)
    shutil.copyfile("../uni.png", "uni_" + (hex(i)[2:]).rjust(2, '0') +".png")
