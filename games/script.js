var _0x3b900a=_0x5862;(function(_0x36ae62,_0x336175){var _0x337738=_0x5862,_0x23e704=_0x36ae62();while(!![]){try{var _0x2706fe=parseInt(_0x337738(0xaf))/0x1+-parseInt(_0x337738(0xa1))/0x2*(-parseInt(_0x337738(0xd0))/0x3)+parseInt(_0x337738(0xa3))/0x4+-parseInt(_0x337738(0xbe))/0x5+parseInt(_0x337738(0xa9))/0x6+-parseInt(_0x337738(0xba))/0x7*(-parseInt(_0x337738(0xcf))/0x8)+parseInt(_0x337738(0xac))/0x9*(-parseInt(_0x337738(0xbd))/0xa);if(_0x2706fe===_0x336175)break;else _0x23e704['push'](_0x23e704['shift']());}catch(_0x2abaa6){_0x23e704['push'](_0x23e704['shift']());}}}(_0x3edd,0x6e466));var DoSayErrorMassege=!![];window['onerror']=(_0x168f6a,_0x5d91bf,_0x51d4fe,_0x1828ad,_0x43b7a7)=>{var _0x66817b=_0x5862;if(DoSayErrorMassege)alert(_0x66817b(0xb2));};const zoom=0x4;var timer=0x0,player=new Object();player['x']=0x19*0x10,player['y']=0x19*0x10,player[_0x3b900a(0xb6)]=0x0,player[_0x3b900a(0x98)]=0x0,player['scrollx']=player['x']+0xa0,player[_0x3b900a(0xc9)]=player['y']+0x18,player[_0x3b900a(0xb3)]=0x0,player[_0x3b900a(0xaa)]=0x0,player[_0x3b900a(0x9d)]=undefined,player['anim']=0x0,player[_0x3b900a(0x99)]=0x0,player['canRotate']=!![];var map=new Object();readMapData(_0x3b900a(0x9e),_0x3b900a(0xa5));var key=new Object();key['up']=![],key[_0x3b900a(0xb7)]=![],key[_0x3b900a(0xc4)]=![],key[_0x3b900a(0xc0)]=![];var img=new Object();img['tiles']=new Image(),img[_0x3b900a(0xcd)][_0x3b900a(0xc2)]=_0x3b900a(0xa0),img[_0x3b900a(0xbb)]=new Image(),img[_0x3b900a(0xbb)][_0x3b900a(0xc2)]=_0x3b900a(0xb1);var tile_image_list=[img[_0x3b900a(0xce)],img[_0x3b900a(0xa2)],img[_0x3b900a(0xc3)]],tile_collision=[![],!![],![],!![]];const tileAtlas=[0x0,0x1,0x2,0x3,0x4,0x5,0x6],playerAtlas=[0x0,0x1,0x2],canvas=document[_0x3b900a(0xcc)](_0x3b900a(0xa4)),ctx=canvas[_0x3b900a(0xbc)]('2d');canvas[_0x3b900a(0x9b)]=0x140*zoom,canvas['height']=0xb4*zoom,ctx[_0x3b900a(0xc8)]=![],ctx['webkitImageSmoothingEnabled']=![],ctx[_0x3b900a(0xa6)]=![],ctx[_0x3b900a(0xb8)]=![];function main(){var _0x570f01=_0x3b900a;ctx['clearRect'](0x0,0x0,0x500*zoom,0x2d0*zoom),addEventListener(_0x570f01(0xbf),keyupfunc,![]),addEventListener(_0x570f01(0xcb),keydownfunc,![]);player[_0x570f01(0xb6)]>0x0?player['xspd']=Math[_0x570f01(0xb9)](player[_0x570f01(0xb6)]*0.85*0x3e8)/0x3e8:player[_0x570f01(0xb6)]=Math['ceil'](player[_0x570f01(0xb6)]*0.85*0x3e8)/0x3e8;player[_0x570f01(0x98)]>0x0?player['yspd']=Math[_0x570f01(0xb9)](player[_0x570f01(0x98)]*0.85*0x3e8)/0x3e8:player['yspd']=Math['ceil'](player['yspd']*0.85*0x3e8)/0x3e8;if(key['up'])player[_0x570f01(0x98)]-=0.5;if(key['down'])player[_0x570f01(0x98)]+=0.5;if(key[_0x570f01(0xc4)])player[_0x570f01(0xb6)]+=0.5;if(key['left'])player[_0x570f01(0xb6)]-=0.5;player_move(player[_0x570f01(0xb6)],player[_0x570f01(0x98)],!![]);if(player[_0x570f01(0xae)])rotate();player[_0x570f01(0xb4)]=player['x']-0xa0+player['scroll_offsetx'],player[_0x570f01(0xc9)]=player['y']-0x50+player[_0x570f01(0xaa)];for(var _0x5aa921=0x0;_0x5aa921<0xd;_0x5aa921++){for(var _0x1ea37e=0x0;_0x1ea37e<0x15;_0x1ea37e++){try{var _0x4f2861=map[_0x570f01(0xa5)]['map1'][_0x5aa921+Math['floor'](player[_0x570f01(0xc9)]/0x10)][_0x1ea37e+Math[_0x570f01(0xb9)](player[_0x570f01(0xb4)]/0x10)];ctx['drawImage'](img[_0x570f01(0xcd)],getTileAtlasXY(_0x4f2861,0x0),getTileAtlasXY(_0x4f2861,0x1),0x10,0x10,(_0x1ea37e*0x10+(0x10-player[_0x570f01(0xb4)]%0x10)-0x10)*zoom,(_0x5aa921*0x10+(0x10-player[_0x570f01(0xc9)]%0x10)-0x10)*zoom,0x10*zoom,0x10*zoom);}catch{}}}if(Math['abs'](player[_0x570f01(0xb6)])+Math['abs'](player[_0x570f01(0x98)])<0x3)player[_0x570f01(0xca)]=0x2;else{if(timer%0x32>0x0)player['anim']=0x0;if(timer%0x32>12.5)player['anim']=0x2;if(timer%0x32>0x19)player[_0x570f01(0xca)]=0x1;if(timer%0x32>37.5)player[_0x570f01(0xca)]=0x2;}ctx['drawImage'](img[_0x570f01(0xbb)],player['anim']*0x10,player['rotate']*0x20,0x10,0x18,(player['x']-player['scrollx'])*zoom,(player['y']-player['scrolly']-0x8)*zoom,0x10*zoom,0x18*zoom);for(var _0x5aa921=0x0;_0x5aa921<0xd;_0x5aa921++){for(var _0x1ea37e=0x0;_0x1ea37e<0x15;_0x1ea37e++){try{var _0x4f2861=map['map']['map2'][_0x5aa921+Math[_0x570f01(0xb9)](player['scrolly']/0x10)][_0x1ea37e+Math[_0x570f01(0xb9)](player['scrollx']/0x10)];ctx[_0x570f01(0xa8)](img[_0x570f01(0xcd)],getTileAtlasXY(_0x4f2861,0x0),getTileAtlasXY(_0x4f2861,0x1),0x10,0x10,(_0x1ea37e*0x10+(0x10-player[_0x570f01(0xb4)]%0x10)-0x10)*zoom,(_0x5aa921*0x10+(0x10-player[_0x570f01(0xc9)]%0x10)-0x10)*zoom,0x10*zoom,0x10*zoom);}catch{}}}timer++,requestAnimationFrame(main);}requestAnimationFrame(main);function keydownfunc(_0x4220a7){var _0x415f5e=_0x3b900a,_0x199429=_0x4220a7[_0x415f5e(0xab)];if(_0x199429==0x25)key['left']=!![];if(_0x199429==0x26)key['up']=!![];if(_0x199429==0x27)key['right']=!![];if(_0x199429==0x28)key[_0x415f5e(0xb7)]=!![];_0x4220a7[_0x415f5e(0x9f)]();}function keyupfunc(_0x5922b5){var _0x1c17a3=_0x3b900a,_0x236933=_0x5922b5[_0x1c17a3(0xab)];if(_0x236933==0x25)key[_0x1c17a3(0xc0)]=![];if(_0x236933==0x26)key['up']=![];if(_0x236933==0x27)key[_0x1c17a3(0xc4)]=![];if(_0x236933==0x28)key[_0x1c17a3(0xb7)]=![];}function player_move(_0x4280f5,_0x4a8ae0,_0x23dc14){var _0x163708=_0x3b900a;for(var _0x27ee19=0x0;_0x27ee19<Math[_0x163708(0xc5)](Math[_0x163708(0xb5)](_0x4280f5));_0x27ee19++){player['x']+=Math['sign'](_0x4280f5);if(hitbox(player['x'],player['y'])&&_0x23dc14)player['x']-=Math[_0x163708(0x9c)](_0x4280f5);}for(var _0x27ee19=0x0;_0x27ee19<Math[_0x163708(0xc5)](Math[_0x163708(0xb5)](_0x4a8ae0));_0x27ee19++){player['y']+=Math[_0x163708(0x9c)](_0x4a8ae0);if(hitbox(player['x'],player['y'])&&_0x23dc14)player['y']-=Math[_0x163708(0x9c)](_0x4a8ae0);}}function _0x5862(_0x316041,_0x82e332){var _0x3eddbb=_0x3edd();return _0x5862=function(_0x5862d8,_0x37618d){_0x5862d8=_0x5862d8-0x97;var _0xd8016d=_0x3eddbb[_0x5862d8];return _0xd8016d;},_0x5862(_0x316041,_0x82e332);}function hitbox(_0x1b4f6e,_0x4185ba){var _0x421d9a=_0x3b900a;if(map[_0x421d9a(0xa5)][_0x421d9a(0xc1)][Math[_0x421d9a(0xb9)](_0x4185ba/0x10+0x0)][Math[_0x421d9a(0xb9)](_0x1b4f6e/0x10+0x0)])return!![];if(map['map'][_0x421d9a(0xc1)][Math[_0x421d9a(0xb9)](_0x4185ba/0x10+0x0)][Math['floor'](_0x1b4f6e/0x10+0.95)])return!![];if(map[_0x421d9a(0xa5)][_0x421d9a(0xc1)][Math['floor'](_0x4185ba/0x10+0.95)][Math['floor'](_0x1b4f6e/0x10+0x0)])return!![];if(map['map'][_0x421d9a(0xc1)][Math[_0x421d9a(0xb9)](_0x4185ba/0x10+0.95)][Math[_0x421d9a(0xb9)](_0x1b4f6e/0x10+0.95)])return!![];}function rotate(){var _0x2e8262=_0x3b900a;if(key['up']&&!key[_0x2e8262(0xb7)]&&!key[_0x2e8262(0xc4)]&&!key['left'])player['rotate']=0x2;if(!key['up']&&key[_0x2e8262(0xb7)]&&!key[_0x2e8262(0xc4)]&&!key[_0x2e8262(0xc0)])player['rotate']=0x0;if(!key['up']&&!key[_0x2e8262(0xb7)]&&key[_0x2e8262(0xc4)]&&!key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x3;if(!key['up']&&!key['down']&&!key[_0x2e8262(0xc4)]&&key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x1;if(key['up']&&!key['down']&&key[_0x2e8262(0xc4)]&&!key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x3;if(key['up']&&!key['down']&&!key['right']&&key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x1;if(!key['up']&&key['down']&&key[_0x2e8262(0xc4)]&&!key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x3;if(!key['up']&&key['down']&&!key['right']&&key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x1;if(!key['up']&&!key[_0x2e8262(0xb7)]&&key[_0x2e8262(0xc4)]&&key['left'])player[_0x2e8262(0x99)]=0x0;if(key['up']&&key['down']&&!key[_0x2e8262(0xc4)]&&!key['left'])player['rotate']=0x0;if(key['up']&&!key[_0x2e8262(0xb7)]&&key[_0x2e8262(0xc4)]&&key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x2;if(!key['up']&&key[_0x2e8262(0xb7)]&&key[_0x2e8262(0xc4)]&&key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x0;if(key['up']&&key[_0x2e8262(0xb7)]&&key[_0x2e8262(0xc4)]&&!key['left'])player[_0x2e8262(0x99)]=0x3;if(key['up']&&key[_0x2e8262(0xb7)]&&!key['right']&&key[_0x2e8262(0xc0)])player['rotate']=0x1;if(key['up']&&key[_0x2e8262(0xb7)]&&key[_0x2e8262(0xc4)]&&key[_0x2e8262(0xc0)])player[_0x2e8262(0x99)]=0x0;}function getTileAtlasXY(_0x36ba32,_0x11408f){var _0x59dd3c=_0x3b900a;if(_0x11408f==0x0)return _0x36ba32%0x10*0x10;if(_0x11408f==0x1)return Math[_0x59dd3c(0xb9)](_0x36ba32/0x10)*0x10;}function getPlayerAtlasXY(_0x767433,_0x10ec7a){return playerAtlas[_0x767433]*0x10;}function hexColour(_0x3bd127){var _0x1cc9ad=_0x3b900a;if(_0x3bd127<0x100)return Math[_0x1cc9ad(0xb5)](_0x3bd127)[_0x1cc9ad(0xad)](0x10);return 0x0;}function decColour(_0x2ebad8){var _0x5b0c38=_0x3b900a;if(_0x2ebad8<0x100)return Math[_0x5b0c38(0xb5)](_0x2ebad8)['toString'](0xa);return 0x0;}function btnUpDown(){key['up']=!![];}function btnUpUp(){key['up']=![];}function btnDownDown(){var _0x8ebde7=_0x3b900a;key[_0x8ebde7(0xb7)]=!![];}function btnDownUp(){var _0x4c09aa=_0x3b900a;key[_0x4c09aa(0xb7)]=![];}function btnLeftDown(){var _0x27bc99=_0x3b900a;key[_0x27bc99(0xc0)]=!![];}function btnLeftUp(){key['left']=![];}function _0x3edd(){var _0x36db6c=['mozImageSmoothingEnabled','scrolly','anim','keydown','getElementById','tiles','empty','1725304LNFvHD','3jBKFSt','map.','yspd','rotate','json','width','sign','image','Map.json','preventDefault','img/tiles.png','210568xocvWA','tile','1243628KkMbFZ','canvas','map','msImageSmoothingEnabled','\x20=\x20json','drawImage','3705618HFUIrR','scroll_offsety','keyCode','369oRAuiv','toString','canRotate','693526ikhaVn','log','img/players.png','エラーが発生しました\x0a再読み込みしてください','scroll_offsetx','scrollx','abs','xspd','down','imageSmoothingEnabled','floor','21XUvPhd','players','getContext','290740pGxWmC','3652945TYyioh','keyup','left','hitbox','src','tile2','right','round','ファイルパスが不正です','then'];_0x3edd=function(){return _0x36db6c;};return _0x3edd();}function btnRightDown(){var _0x1be413=_0x3b900a;key[_0x1be413(0xc4)]=!![];}function btnRightUp(){var _0x2de5b6=_0x3b900a;key[_0x2de5b6(0xc4)]=![];}function setMapData(_0x44040a,_0x588060){var _0x1dab61=_0x3b900a;eval(_0x1dab61(0x97)+_0x588060+_0x1dab61(0xa7)),map[_0x1dab61(0xa5)]=_0x44040a,console[_0x1dab61(0xb0)](map[_0x1dab61(0xa5)]);}function readMapData(_0x5dba2d,_0x151b09){var _0x119d84=_0x3b900a,_0x36a821=[];if(_0x5dba2d['indexOf'](';')==-0x1)try{fetch(_0x5dba2d)['then'](_0x3e552c=>_0x3e552c[_0x119d84(0x9a)]())[_0x119d84(0xc7)](_0x33c392=>setMapData(_0x33c392,_0x151b09));}catch{alert('no');}else alert(_0x119d84(0xc6));}