//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-present, Egret Technology.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright
//       notice, this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//     * Neither the name of the Egret nor the
//       names of its contributors may be used to endorse or promote products
//       derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////
var Main = (function (_super) {
    __extends(Main, _super);
    function Main() {
        _super.call(this);
        this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
    }
    var d = __define,c=Main,p=c.prototype;
    p.onAddToStage = function (event) {
        //设置加载进度界面
        //Config to load process interface
        this.loadingView = new LoadingUI();
        this.stage.addChild(this.loadingView);
        //初始化Resource资源加载库
        //initiate Resource loading library
        RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.loadConfig("resource/default.res.json", "resource/");
        this.loadSound(); //music
    };
    //音乐函数
    p.loadSound = function () {
        var sound = this._sound = new egret.Sound();
        ;
        //sound 加载完成监听
        sound.addEventListener(egret.Event.COMPLETE, function (e) {
            this.init();
        }, this);
        sound.load("resource/assets/Justin Hurwitz - Fletcher's Song In Club_mp3");
    };
    /**
     * 配置文件加载完成,开始预加载preload资源组。
     * configuration file loading is completed, start to pre-load the preload resource group
     */
    p.onConfigComplete = function (event) {
        RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
        RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
        RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
        RES.loadGroup("preload");
    };
    /**
     * preload资源组加载完成
     * Preload resource group is loaded
     */
    p.onResourceLoadComplete = function (event) {
        if (event.groupName == "preload") {
            this.stage.removeChild(this.loadingView);
            RES.removeEventListener(RES.ResourceEvent.GROUP_COMPLETE, this.onResourceLoadComplete, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_LOAD_ERROR, this.onResourceLoadError, this);
            RES.removeEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceProgress, this);
            RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, this.onItemLoadError, this);
            this.createGameScene();
        }
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onItemLoadError = function (event) {
        console.warn("Url:" + event.resItem.url + " has failed to load");
    };
    /**
     * 资源组加载出错
     *  The resource group loading failed
     */
    p.onResourceLoadError = function (event) {
        //TODO
        console.warn("Group:" + event.groupName + " has failed to load");
        //忽略加载失败的项目
        //Ignore the loading failed projects
        this.onResourceLoadComplete(event);
    };
    /**
     * preload资源组加载进度
     * Loading process of preload resource group
     */
    p.onResourceProgress = function (event) {
        if (event.groupName == "preload") {
            this.loadingView.setProgress(event.itemsLoaded, event.itemsTotal);
        }
    };
    /**
     * 创建游戏场景
     * Create a game scene
     */
    p.createGameScene = function () {
        var stageW = this.stage.stageWidth;
        var stageH = this.stage.stageHeight;
        //scroll
        this.scrollRect = new egret.Rectangle(0, 0, stageW * 5, this.stage.stageHeight); //页面数修改处
        this.cacheAsBitmap = true;
        this.touchEnabled = true;
        var starttouchpointX = 0;
        var startstagepointX = 0;
        var movedistance = 0;
        this.addEventListener(egret.TouchEvent.TOUCH_BEGIN, startScroll, this);
        this.addEventListener(egret.TouchEvent.TOUCH_END, stopScroll, this);
        function startScroll(e) {
            if ((this.scrollRect.x % stageW) != 0) {
                this.scrollRect.x = startstagepointX; //如果图片位置错误，返回上一个正确位置；
            }
            starttouchpointX = e.stageX;
            startstagepointX = this.scrollRect.x;
            this.addEventListener(egret.TouchEvent.TOUCH_MOVE, onScroll, this);
        }
        function onScroll(e) {
            var rect = this.scrollRect;
            movedistance = starttouchpointX - e.stageX;
            rect.x = (startstagepointX + movedistance);
            this.scrollRect = rect;
        }
        function stopScroll(e) {
            var rect = this.scrollRect;
            if ((movedistance >= (this.stage.stageWidth / 3)) && startstagepointX != stageW * 4) {
                rect.x = startstagepointX + stageW;
                this.scrollRect = rect;
                movedistance = 0;
            }
            else if ((movedistance <= (-(this.stage.stageWidth / 3))) && startstagepointX != 0) {
                rect.x = startstagepointX - stageW;
                this.scrollRect = rect;
                movedistance = 0;
            }
            else {
                movedistance = 0;
                rect.x = startstagepointX;
                this.scrollRect = rect;
            }
            this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, onScroll, this);
        }
        //scroll end
        //page 1
        var page1 = new egret.DisplayObjectContainer();
        this.addChild(page1);
        page1.width = stageW;
        page1.height = stageH;
        var sky1 = this.createBitmapByName("newbg_jpg");
        this.addChild(sky1);
        sky1.width = stageW;
        sky1.height = stageH;
        var topMask = new egret.Shape();
        topMask.graphics.beginFill(0xffffff, 0.5);
        topMask.graphics.drawRect(0, 0, stageW, 172);
        topMask.graphics.endFill();
        topMask.y = 33;
        this.addChild(topMask);
        var icon = this.createBitmapByName("logo_png");
        this.addChild(icon);
        icon.scaleX = 0.16;
        icon.scaleY = 0.14;
        icon.x = 26;
        icon.y = 33;
        var line = new egret.Shape();
        line.graphics.lineStyle(2, 0x000000);
        line.graphics.moveTo(0, 0);
        line.graphics.lineTo(0, 117);
        line.graphics.endFill();
        line.x = 222;
        line.y = 61;
        this.addChild(line);
        //左右滚动提示
        var line2 = new egret.Shape();
        line2.graphics.lineStyle(10, 0xffffff);
        line2.graphics.moveTo(0, 0);
        line2.graphics.lineTo(-20, -50);
        line2.graphics.endFill();
        line2.x = 600;
        line2.y = stageH / 2;
        this.addChild(line2);
        var line3 = new egret.Shape();
        line3.graphics.lineStyle(10, 0xffffff);
        line3.graphics.moveTo(0, 0);
        line3.graphics.lineTo(-20, 50);
        line3.graphics.endFill();
        line3.x = 600;
        line3.y = stageH / 2;
        this.addChild(line3);
        var change = function () {
            var tw2 = egret.Tween.get(line2);
            tw2.to({ "alpha": 1 }, 500);
            tw2.wait(1500);
            tw2.to({ "alpha": 0 }, 500);
            tw2.call(change, self);
            var tw3 = egret.Tween.get(line3);
            tw3.to({ "alpha": 1 }, 500);
            tw3.wait(1500);
            tw3.to({ "alpha": 0 }, 500);
            tw3.call(change, self);
        };
        change();
        //左右滚动提示结束
        var colorLabel = new egret.TextField();
        colorLabel.textColor = 0x000000;
        colorLabel.width = stageW - 172;
        colorLabel.textAlign = "center";
        colorLabel.text = "Personal Profile";
        colorLabel.size = 31;
        colorLabel.x = 172;
        colorLabel.y = 80;
        this.addChild(colorLabel);
        var textfield = new egret.TextField();
        this.addChild(textfield);
        textfield.alpha = 0;
        textfield.width = stageW - 172;
        textfield.textAlign = egret.HorizontalAlign.CENTER;
        textfield.size = 29;
        textfield.textColor = 0x000000;
        textfield.x = 172;
        textfield.y = 135;
        this.textfield = textfield;
        //循环播放音乐
        var sound = RES.getRes("Justin Hurwitz - Fletcher's Song In Club_mp3");
        var channel = sound.play(0, -1);
        this.content = new egret.TextField();
        this.content.text = "张天意的个人简介";
        this.content.textColor = 0x000000;
        this.content.bold = true;
        this.content.stroke = 2;
        this.content.strokeColor = 0xffffff;
        this.content.y = 260;
        this.content.x = 35;
        this.content.size = 40;
        this.addChild(this.content);
        this.content1 = new egret.TextField();
        this.content1.text = "毕业于北京市第九中学\n\n目前在北京工业大学完成本科学业\n\n最近疯狂迷恋爵士乐\n\n一如既往的冲天梯\n\nlost caslte正在努力的打伯爵\n\n梦想成为一流程序员 二流摄影师\n\n三流小主播";
        this.content1.textColor = 0x000000;
        this.content1.bold = true;
        this.content1.stroke = 2;
        this.content1.strokeColor = 0xffffff;
        this.content1.y = 370;
        this.content1.x = 35;
        this.content1.size = 35;
        this.addChild(this.content1);
        //page 1 end
        //page 2
        var page2 = new egret.DisplayObjectContainer();
        this.addChild(page2);
        page2.x = stageW;
        page2.width = stageW;
        page2.height = stageH;
        var sky2 = this.createBitmapByName("newbg_jpg");
        page2.addChild(sky2);
        sky2.width = stageW;
        sky2.height = stageH;
        var page2pic1 = this.createBitmapByName("pic1_jpg");
        page2.addChild(page2pic1);
        page2pic1.x = this.stage.stageWidth / 2;
        page2pic1.y = this.stage.stageHeight / 2;
        page2pic1.anchorOffsetX = page2pic1.width / 2;
        page2pic1.anchorOffsetY = page2pic1.height / 2;
        page2pic1.scaleX = 0.2;
        page2pic1.scaleY = 0.2;
        var picmove = function () {
            var pictw = egret.Tween.get(page2pic1);
            pictw.to({ "rotation": 10 }, 100);
            pictw.to({ "rotation": -10 }, 100);
            pictw.to({ "rotation": 0 }, 100);
            pictw.wait(1500);
            pictw.call(picmove, self);
        };
        picmove();
        var line4 = new egret.Shape();
        line4.graphics.lineStyle(10, 0xffffff);
        line4.graphics.moveTo(0, 0);
        line4.graphics.lineTo(-20, -50);
        line4.graphics.endFill();
        line4.x = 600;
        line4.y = stageH / 2;
        page2.addChild(line4);
        var line5 = new egret.Shape();
        line5.graphics.lineStyle(10, 0xffffff);
        line5.graphics.moveTo(0, 0);
        line5.graphics.lineTo(-20, 50);
        line5.graphics.endFill();
        line5.x = 600;
        line5.y = stageH / 2;
        page2.addChild(line5);
        var change2 = function () {
            var tw2 = egret.Tween.get(line4);
            tw2.to({ "alpha": 1 }, 500);
            tw2.wait(1500);
            tw2.to({ "alpha": 0 }, 500);
            tw2.call(change2, self);
            var tw3 = egret.Tween.get(line5);
            tw3.to({ "alpha": 1 }, 500);
            tw3.wait(1500);
            tw3.to({ "alpha": 0 }, 500);
            tw3.call(change2, self);
        };
        change2();
        var line6 = new egret.Shape();
        line6.graphics.lineStyle(10, 0xffffff);
        line6.graphics.moveTo(0, 0);
        line6.graphics.lineTo(20, -50);
        line6.graphics.endFill();
        line6.x = 40;
        line6.y = stageH / 2;
        page2.addChild(line6);
        var line7 = new egret.Shape();
        line7.graphics.lineStyle(10, 0xffffff);
        line7.graphics.moveTo(0, 0);
        line7.graphics.lineTo(20, 50);
        line7.graphics.endFill();
        line7.x = 40;
        line7.y = stageH / 2;
        page2.addChild(line7);
        var change3 = function () {
            var tw2 = egret.Tween.get(line6);
            tw2.to({ "alpha": 1 }, 500);
            tw2.wait(1500);
            tw2.to({ "alpha": 0 }, 500);
            tw2.call(change2, self);
            var tw3 = egret.Tween.get(line7);
            tw3.to({ "alpha": 1 }, 500);
            tw3.wait(1500);
            tw3.to({ "alpha": 0 }, 500);
            tw3.call(change3, self);
        };
        change3();
        //page 2 end
        //page 3
        var page3 = new egret.DisplayObjectContainer();
        this.addChild(page3);
        page3.x = stageW * 2;
        page3.width = stageW;
        page3.height = stageH;
        var sky3 = this.createBitmapByName("newbg_jpg");
        page3.addChild(sky3);
        sky3.width = stageW;
        sky3.height = stageH;
        //page 3 end
        //根据name关键字，异步获取一个json配置文件，name属性请参考resources/resource.json配置文件的内容。
        // Get asynchronously a json configuration file according to name keyword. As for the property of name please refer to the configuration file of resources/resource.json.
        RES.getResAsync("description_json", this.startAnimation, this);
    };
    /**
     * 根据name关键字创建一个Bitmap对象。name属性请参考resources/resource.json配置文件的内容。
     * Create a Bitmap object according to name keyword.As for the property of name please refer to the configuration file of resources/resource.json.
     */
    p.createBitmapByName = function (name) {
        var result = new egret.Bitmap();
        var texture = RES.getRes(name);
        result.texture = texture;
        return result;
    };
    /**
     * 描述文件加载成功，开始播放动画
     * Description file loading is successful, start to play the animation
     */
    p.startAnimation = function (result) {
        var self = this;
        var parser = new egret.HtmlTextParser();
        var textflowArr = [];
        for (var i = 0; i < result.length; i++) {
            textflowArr.push(parser.parser(result[i]));
        }
        var textfield = self.textfield;
        var count = -1;
        var change = function () {
            count++;
            if (count >= textflowArr.length) {
                count = 0;
            }
            var lineArr = textflowArr[count];
            self.changeDescription(textfield, lineArr);
            var tw = egret.Tween.get(textfield);
            tw.to({ "alpha": 1 }, 200);
            tw.wait(2000);
            tw.to({ "alpha": 0 }, 200);
            tw.call(change, self);
        };
        change();
    };
    /**
     * 切换描述内容
     * Switch to described content
     */
    p.changeDescription = function (textfield, textFlow) {
        textfield.textFlow = textFlow;
    };
    return Main;
}(egret.DisplayObjectContainer));
egret.registerClass(Main,'Main');
//# sourceMappingURL=Main.js.map