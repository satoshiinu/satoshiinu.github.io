function iecheck (userAgent){
    siteID=0;
    if (userAgent.indexOf('MSIE') === -1 || userAgent.indexOf('TRIDENT') === -1) {
        siteID=0;
    } else {
        document.write("InternetExplorerではプレイできません")
        siteID=1;
    }
    //if(Array.isArray(userAgent)&&userAgent.indexOf(document)===-1)location.href=userAgent[siteID];
}

iecheck(window.navigator.userAgent.toUpperCase())