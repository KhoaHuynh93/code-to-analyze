var startBillboardSlide;
var startTopicsSlide;


(function(){

    var VIDEO_WIDTH          = 1220;
    var VIDEO_HEIGHT         = 640;
    var NEWS_COLUMN_WIDTH    = 280;
    var NEWS_COLUMN_MARGIN   = 10;

    var __domCreated         = false;

    var __emergencyXMLLoaded = false;
    var __billboardXMLLoaded = false;
    var __topicsXMLLoaded    = false;
    var __newsXMLLoaded      = false;
    var __videoXMLLoaded     = false;

    var __emergencyData;
    var __billboardXML;
    var __topicsXML;
    var __newsXML;
    var __videoXML;

    var __topicsNum;
    var __newsTopcsNum;
    var $topicsCount;
    var $topicsListItem;


    // EMERGENCY XML
    $.ajax({
        url     : "/emergency/emergency.xml",
        cache   : false,
        dataType: 'text',
        success : function(data){
            __emergencyXMLLoaded = true;
            __emergencyData  = data;
            if(__domCreated){
                makeEmergency();
            }
        },
        error: function(a,b,c){
            console.log(a,b,c);
        }
    });


    // BILLBOARD XML
    $.ajax({
        url     : "/xml/billboard.xml",
        cache   : false,
        dataType: 'xml',
        success : function(xml){
            __billboardXMLLoaded = true;
            __billboardXML       = xml;
            if(__domCreated){
                makeBillboard();
            }
        },
        error: function(a,b,c){
            console.log(a,b,c);
        }
    });

    // TOPICS XML
    $.ajax({
        url     : "/xml/topics.xml",
        cache   : false,
        dataType: 'xml',
        success : function(xml){
            __topicsXMLLoaded = true;
            __topicsXML  = xml;
            if(__domCreated){
                makeTopics();
            }
        },
        error: function(a,b,c){
            console.log(a,b,c);
        }
    });


    // NEWS　XML
    $.ajax({
        url     : "/news/news.xml",
        cache   : false,
        dataType: 'xml',
        success : function(xml){
            __newsXMLLoaded = true;
            __newsXML  = xml;
            if(__domCreated){
                makeNews();
            }
        },
        error: function(a,b,c){
            console.log(a,b,c);
        }
    });


    // VIDEO XML
    $.ajax({
        url     : "/video/video.xml",
        cache   : false,
        dataType: 'xml',
        success : function(xml){
            __videoXMLLoaded = true;
            __videoXML  = xml;
            if(__domCreated){
                makeVideo();
            }
        },
        error: function(a,b,c){
            console.log(a,b,c);
        }
    });


    /**
     *  ビルボード部分作成
     */
    function makeBillboard(){
        var $item           = $(__billboardXML).find("item");
        var $billboard      = $("#billboard");
        var $billboardList  = $("#billboard_list");
        var $billboardNav   = $("#billboard_nav");
        var blockList       = [];
        var currentIndex    = 0;

        if($item.size() <= 1){
            $billboardNav.hide();
            $(".pagenation_nav").hide();
        }

        $item.each(function(i){
            var $this       = $(this);
            var fileName    = $this.attr("image");
            var thumbName   = util.getSuffixName(fileName, "_ss");

            // 画像
            var $block  = $("<div></div>");
            var $img    = $("<img />");
            $img.attr("src", "/img/billboard/"+fileName);
            $img.attr("width", "100%");

            // 詳細
            var $itemHead = $this.find('header');
            var $itemBody = $this.find('body');
            if($itemHead.size() > 0 || $itemBody.size() > 0 ){
                $itemHead = $itemHead.eq(0);
                $itemBody = $itemBody.eq(0);
                var $div = $('<div class="bill_info"></div>');

                if( $itemHead.size() > 0){
                    $div.append('<header>'+$itemHead.text()+'</header>');
                }
                if( $itemBody.size() > 0){
                    $infoBody = $('<div class="bill_info_body">'+$itemBody.text()+'</div>');
                    $div.append($infoBody);

                }
                var itemRef = $this.attr('href');
                if(itemRef !== undefined && itemRef != ""){
                    $div.append('<a class="more_info" href="'+itemRef+'" target="_blank">More Information</a>');
                }
                $block.append($div);
            }

            // サムネイル
            var $thumbLi = $("<li></li>");
            var $thumbImg = $("<img />");
            $thumbImg.attr("src", "/img/billboard/"+thumbName)
                .attr("width","30")
                .attr("height", "30");



            $thumbLi.append($thumbImg);
            $billboardNav.append($thumbLi);

            // 初期設定
            if(i > 0){ $block.css({display:"none"}); }
            else {$thumbLi.addClass("current"); }

            // クリック時
            $thumbLi.click(function(){
                if( i == currentIndex ){ return false; }
                var $this   = $thumbLi;
                var old     = currentIndex;

                var $current = $billboardNav.find(".current");
                $current.removeClass("current");
                $this.addClass("current");
                blockList[old].stop().css({
                    "z-index" : 2,
                    "opacity" : 1
                }).fadeOut();

                blockList[i].stop().css({
                    "z-index" : 1,
                    "opacity" : 1,
                    "display" : "block"
                });
                currentIndex = i;

                clearInterval(intervalID);
                intervalID = setInterval(intervalCurrentChange, 6000);
            });

            $block.append($img);
            $billboardList.append($block);
            blockList.push($block);
        });

        var intervalID;
        startBillboardSlide = function () {
            intervalID = setInterval(intervalCurrentChange, 6000);
        }
        startBillboardSlide();


        function intervalCurrentChange(){
            var target = currentIndex+1;
            if(target >= blockList.length){
                target = 0;
            }
            $billboardNav.find("li").eq(target).trigger("click");
        }

        $("#billboard_prev").click(function(){
            var target = currentIndex -1;
            if(target < 0){
                target = blockList.length-1;
            }
            $billboardNav.find("li").eq(target).trigger("click");
            return false;
        });
        $("#billboard_next").click(function(){
            var target = currentIndex + 1;
            if(target >= blockList.length){
                target = 0;
            }

            $billboardNav.find("li").eq(target).trigger("click");
            return false;
        });

        layout();
        util.setResizeHandler(layout);


        function layout(){
            var w = $billboard.width();
            var h = Math.floor(w * (685/1220));

            for(var i = blockList.length - 1; i >= 0 ; i -- ){
                blockList[i].css({
                    width :w,
                    height:h
                })
            }

            $billboardList.css({
                width :w,
                height:h
            });
        }
    }




    /**
     *  Video部分作成
     */
    function makeVideo(){
        var $videoList      = $("#video_list");
        var $videoListItem;
        var $videoThumb     = $("#video_thumb");
        var videoEnable     = false;
        var currentVideo    = 0;
        var vid             = "";

        // ビデオからピックアップビデオを取り出す
        var $xmlVideo = $(__videoXML).find("video.pickup");


        $xmlVideo.sort(function(a, b){
            var a_num = $(a).attr("number");
            var b_num = $(b).attr("number");

            if( a_num === undefined && b_num === undefined ){
                return 0;
            }
            if( a_num === undefined ){
                return 1;
            }
            if( b_num === undefined ){
                return -1;
            }
            return parseInt(a_num) -  parseInt(b_num);
        })

        // 要素を作成
        $xmlVideo.each(function(i){

            var $this = $(this);
            var this_vid = $this.attr('video_id');
            if(i == 0){
                vid = this_vid;
            }


            var thumbnail = $this.attr('thumbnail');

            // 大きいサムネイルの作成
            (function(){
                var $img = $("<img />");
                $img.attr("src", "video/img/"+thumbnail);
                $img.attr("class", "large_thumb");

                var $playBtn = $("<img />");
                $playBtn
                    .attr("src", "/img/common/btn_video_play.png")
                    .attr("class", "play_btn")

                var $a  = $("<a></a>");
                $a.append($playBtn);
                $a.attr("href", "#"+this_vid);
                $playBtn.rollover();

                var $li = $("<li></li>");
                $li.append($img)
                $li.append($a);
                $videoList.append($li);

                if(i > 0){
                    $li.css({display:"none"});
                }
            })();

            // 小さいサムネイルの作成
            (function(){
                var ssThumbnail = util.getSuffixName(thumbnail, "_ss");
                $img = $("<img />");
                $img.attr("src", "/video/img/"+ssThumbnail);

                var $a = $("<a></a>")
                    .append($img)
                    .attr("href", "#"+this_vid);


                var $li = $("<li></li>");
                $li.append($a);
                $videoThumb.append($li);
                if(i == 0){
                    $li.addClass("current");
                }

                // クリック時イベント
                $a.click(function(){

                    if(currentVideo == i){
                        return false;
                    }
                    var $old        = $videoListItem.eq(currentVideo);
                    var $next       = $videoListItem.eq(i);
                    var s           = i < currentVideo ? 1 : -1
                    currentVideo    = i;
                    pagination($old, $next, s);
                    return false;
                })
            })();
        });
        // アイテムリストを設定しておく
        $videoListItem = $("li", $videoList);


        // YT初期化
        var videoInited = false;
        var playerBox = new YtApiPlayer({
            $target : $("#video_frame"),
            vid     : vid
        });

        playerBox.onReady = function(){
            videoInited = true;
            playerBox.player.stopVideo();
        }

        playerBox.onStateChange = function(state){
            if(state.data == YT.PlayerState.ENDED){
                $("#video_frame").css("z-index", "-1");
                videoEnable = false;
            }
            if(state.data == YT.PlayerState.PLAYING){
                ga('send', 'play','index_video:' + state.target.getVideoUrl() );
            }
        }


        // ページ送り
        $("#video_prev").click(function(){
            var w = $videoList.width();
            var $old    = $videoListItem.eq(currentVideo);
            currentVideo--;
            if(currentVideo < 0){
                currentVideo = $videoListItem.size()-1;
            }
            var $next   = $videoListItem.eq(currentVideo);
            pagination($old, $next, 1);
            return false;
        });

        $("#video_next").click(function(){
            var $old    = $videoListItem.eq(currentVideo);
            currentVideo++;
            if(currentVideo >= $videoListItem.size()){
                currentVideo = 0;
            }

            var $next   = $videoListItem.eq(currentVideo);

            pagination($old, $next, -1);
            return false;
        });


        $("a", $videoList).click( function(){
            if(!videoInited){
                setTimeout(function(){
                    $(this).trigger("click");
                }, 500);
                return false;
            }

            $("#video_frame").css({
                    "z-index" : 5
                })
                .attr("width", "100%")
                .attr("height", "100%");
            videoEnable = true;

            playerBox.player.playVideo();
            return false;
        });


        // リサイズ時のイベント設定
        layout();
        util.setResizeHandler(layout);

        // ビデオフレームのりサイズ処理
        function layout(){
            var w = $videoList.width();
            var h = Math.floor(w * VIDEO_HEIGHT / VIDEO_WIDTH);

            $videoList.css({
                height:h
            })

            $("#video_frame").css({
                width: w,
                height:h
            });
        }

        // ページネーション
        function pagination($old, $next, s, animate){
            if(animate === undefined) { animate = true; }

            if(videoEnable){
                $("#video_frame").css({
                    "z-index" : -1
                })
                videoEnable = false;
            }

            var w = $videoList.width();

            if(animate){
                $old.stop().animate({
                    left: (w + 20) * s
                }, 500, "easeInOutQuad", function(){
                    $(this).css("display","none");
                });

                $next.css({
                    left:- (w + 20) * s,
                    display: "block"
                }).stop().animate({
                    left : 0
                }, 500, "easeInOutQuad")
            }else{
                $old.css("display","none");
                $next.css({
                    "display":"block",
                    "left":0
                })
            }

            $('.current', $videoThumb)
                .removeClass('current');

            $('li', $videoThumb).eq(currentVideo)
                .addClass('current');

            var href = $("a", $next).attr("href").slice(1);

            playerBox.player.cueVideoById(href);
        }

        //-----------------------------------------
        // カレントをランダム化 Film & DVDが落ち着いたら削除
        //-----------------------------------------
        // var checkIntervalID = setInterval( function(){
        //     if(!videoInited){ return; }
        //     clearInterval(checkIntervalID);
        //     checkIntervalID = null;

        //     var rand = Math.floor(Math.random() * 3);
        //     if(rand == 0){
        //         return false;
        //     }
        //     var $old        = $videoListItem.eq(currentVideo);
        //     var $next       = $videoListItem.eq(rand);
        //     var s           = rand < currentVideo ? 1 : -1
        //     currentVideo    = rand;
        //     pagination($old, $next, s, false);
        // }, 100 );
    }

    /**
     *  ニュース部分作成
     */
    function makeNews(){
        var $wrapper        = $("#news");
        var $topicElems     = []
        var $newsList       = $("#news_list");
        var $newsArea       = $("#news_scroll_area");
        var $topicsList     = $(__newsXML).find("news.topic");
        __newsTopicsNum     = $topicsList.size();

        var col         = 0;
        var offset      = 0;
        var current     = 0;
        var readElem    = 0;

        layout();

        // リサイズ時のイベント設定
        util.setResizeHandler(layout);

        // トピックス書き出し
        setTopics();

        function setTopics(){
            for( var i = readElem ; i < __newsTopicsNum ; i++ ){
                if(i > current + col + 4){
                    break;
                }

                var $topic = $topicsList.eq(i);
                var $li = $("<li></li>");
                // $li.attr("testCOunt", i);
                $newsList.append($li);

                // リンク先指定があれば取得
                var href = $topic.attr("href");
                var target = $topic.attr("target");


                if($topic.attr("border") == "on"){
                    $li.addClass("border");
                }
                $li.css({
                    left : i * (NEWS_COLUMN_WIDTH + NEWS_COLUMN_MARGIN),
                    display:  current <= i  && i < current + col ? "block" : "none"
                })

                var date    = $topic.attr("date").split(".");
                var date_Y  = util.finger(parseInt(date[0]), 4);
                var date_M  = util.finger(parseInt(date[1]), 2);
                var date_D  = util.finger(parseInt(date[2]), 2);

                var $a = $("<a></a>");
                $a.attr("href",
                    href != undefined ? href :
                    (i>0 ? "/news/#date_"+date_Y+date_M+date_D : "/news/") )
                if(href != undefined && target != undefined){
                    $a.attr("target", target);
                }
                $li.append($a);

                var $img = $("<img />");
                $img.attr("src", "/news/img/"+$topic.attr("thumb_name") );


                var $div = $("<div>" + date_Y + "." + date_M + "." + date_D + "</div>")
                    .attr("class", "date");

                var $p = $("<p>"+$topic.find("news_header").text()+"</p>");

                $a.append($img)
                    .append($div)
                    .append($p);

                readElem = i+1;

                $topicElems.push($li);
            }
        }

        $("#news_next").click(function(){
            if(current >= __newsTopicsNum - col){ return false; }
            $topicElems[current].fadeOut(150);
            $topicElems[current+col].fadeIn(150);
            current++;
            setTopics();
            setAnimate();
            return false;
        });


        $("#news_prev").click(function(){
            if(current <= 0){ return false; }
            $topicElems[current-1].fadeIn(400);
            $topicElems[current+col-1].fadeOut(400);
            current--;
            setAnimate();
            return false;
        });

        // アニメーション移動
        function setAnimate(){
            $newsList.stop().animate({
                left : offset - current*(NEWS_COLUMN_WIDTH+NEWS_COLUMN_MARGIN)
                }, 250, "easeOutQuart"
            );

        }


        // ウィンドウサイズ変更時
        function layout(){
            var width   = $wrapper.width();
            var oldCol  = col;
            col         = Math.floor( width / (NEWS_COLUMN_WIDTH + NEWS_COLUMN_MARGIN))
            offset      = (width - (col * (NEWS_COLUMN_WIDTH + NEWS_COLUMN_MARGIN) - NEWS_COLUMN_MARGIN)) / 2;
            $newsList.css({
                left: offset - current*(NEWS_COLUMN_WIDTH+NEWS_COLUMN_MARGIN)
            });

            setTopics();

            if(oldCol < col){
                for(var i=oldCol ; i<col ; i++){
                    $topicElems[current+i].fadeIn(400);
                }
            }else if(oldCol > col){
                for(var i = oldCol ; i>=col ; i--){
                    $topicElems[current+i].fadeOut(400);
                }
            }

            return col;
        }
    }





    /**
     *  トピックス作成
     *  @param[in,out] name
     *  @return
     */
    function makeTopics(){
        var $topicsCount = $("#topics_count");
        var $topicsList = $("#topics_list");
        var $topic      = $(__topicsXML).find("topic");
        __topicsNum     = $topic.size();

        for( var i = 0 ; i < __topicsNum ; i++ ){
            $topicsList.append("<li>"+$topic.eq(i).text()+"</li>");
        }

        $topicsListItem = $("#topics_list>li");

        var topicsCurrent  = 0;
        setCurrent();

        $("#topics_prev").click(function(){
            var old = topicsCurrent;
            topicsCurrent--;
            if(topicsCurrent < 0){ topicsCurrent = __topicsNum-1; }
            setAnimate(topicsCurrent, old);
            setCurrent();

            return false;
        });

        $("#topics_next").click(function(){
            var old = topicsCurrent;
            topicsCurrent++;
            if(topicsCurrent >= __topicsNum){ topicsCurrent = 0; }
            setAnimate(topicsCurrent, old);
            setCurrent();
            return false;
        });

        // トピックスにマウスオーバーしている時stop
        var topicsHover;
        startTopicsSlide = function () {
            topicsHover = setInterval(topicsAutoPaging, 5000);
        }
        startTopicsSlide();
        $(".topics").hover(function(){
            clearInterval(topicsHover);
        }, function(){
            topicsHover = setInterval( topicsAutoPaging, 5000)
        });

        function topicsAutoPaging(){
            $("#topics_next").trigger("click");
        }




        function setAnimate(current, old){
            var movLen = current < old ? -20 : 20;
            if(Math.abs(current-old) > 1){ movLen = -movLen;}
            $topicsListItem.eq(current)
                .css({
                    "z-index" : 2,
                    "display" : "block",
                    "opacity" : "0.0",
                    "top" : movLen
                })
                .animate({
                    "top"       : 0,
                    "opacity"   : 1.0
                }, 250, "easeOutQuart");

            $topicsListItem.eq(old)
                .css({
                    "z-index":1
                }).
                animate({
                    top : -movLen
                }, 250, "easeOutQuart", function(){
                    $(this).css({display:"none"});
                })

        }

        function setCurrent(){
            $topicsCount.text( (topicsCurrent+1) + " / " + __topicsNum );
        }
    }



    /**
     *  エマージェンシーモード作成
     */
    function makeEmergency(){

        var source;
        source = util.replaceAll(__emergencyData, "<head>", "<head><![CDATA[");
        source = util.replaceAll(source, "</head>", "]]></head>");
        source = util.replaceAll(__emergencyData, "<body>", "<body><![CDATA[");
        source = util.replaceAll(source, "</body>", "]]></body>");
        source = util.replaceAll(source, "<br>", "<br />");
        var $xml = $($.parseXML(source));

        var $emergency = $xml.find("emergency");
        if($emergency.attr("activity") != "on"){ return; }

        var modalInstance = $.modalFrame();
        var $emergency
        var $head = $("<div id='emergency_header'>"+$emergency.find("head").text()+"</div>");
        var $body = $("<div id='emergency_body'>"+$emergency.find("body").text()+"</div>");
        var $emergency_frame = $('<div id="emergency_frame"></div>');
        $emergency_frame
            .append($head)
            .append($body);

        modalInstance.open($emergency_frame, false);

        $(window).load(function(){
            $('html,body').animate({ scrollTop: 0 }, 1);
        });
    }

    /**
     *  jQuery Ready
     */
    $(function(){
        __domCreated = true;
        if(__emergencyXMLLoaded) { makeEmergency(); }
        if(__billboardXMLLoaded) { makeBillboard(); }
        if(__topicsXMLLoaded)    { makeTopics();    }
        if(__newsXMLLoaded)      { makeNews();      }
        if(__videoXMLLoaded)     { makeVideo();     }
    });

})();
