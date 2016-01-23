var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(callback) {
    setTimeout(callback, 1000 / 60);
};
(function() {
    document.addEventListener('touchmove', function(event) {
        event.preventDefault();
    }, false);
    var agent = navigator.userAgent.toLowerCase(); //检测是否是ios
    var iLastTouch = null; //缓存上一次tap的时间
    if (agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0) {
        document.body.addEventListener('touchend', function(event) {
            var iNow = new Date().getTime();
            iLastTouch = iLastTouch || iNow + 1;
            /** 第一次时将iLastTouch设为当前时间+1 */
            var delta = iNow - iLastTouch;
            if (delta < 300 && delta > 0) {
                event.preventDefault();
                return false;
            }
            iLastTouch = iNow;
        }, false);
    }

})();



jQuery(function($) {
    var showModal = function() {
        var modalBackdrop = $('<div class="modal-backdrop fade"></div>');
        modalBackdrop.appendTo('body');
        window.setTimeout(function() {
            modalBackdrop.addClass('in');
        }, 16);
    };

    var hideModal = function() {
        $('.modal-backdrop').removeClass('in').on('transitionEnd webkitTransitionEnd', function() {
            $(this).remove();
        });
    };

    var showRule = function() {};
    var hideRule = function() {
        $('.rule-container').hide();
    };

    $('#btn-start-game').on('click', function(e) {
        e.preventDefault();
        $('.scenes').removeClass('active');
        $('.scenes-start').addClass('active');
        showModal();
    });

    $('#go-to-game').on('click', function(e) {
        e.preventDefault();
        $('.scenes').removeClass('active');
        $('.scenes-start').addClass('active');
        showModal();
    });

    $('#start-game').on('click', function(e) {
        e.preventDefault();
        hideModal();
        $('.rule-container').hide();
        startGame();
    });

    $('.pig').on('touchstart click', function(e) {
        e.preventDefault();
        clickTimes++;
        $('.circle').css('animation-name', 'scale');
        $(this).css('transform', 'scale(1.3, 1.3)');
        $('.clickme').css('opacity', 0);
        $(this).on('transitionEnd webkitTransitionEnd', function() {
            $(this).css('transform', 'scale(1, 1)');
            $('.clickme').css('opacity', 1);
            $('.circle').css('animation-name', '');
        });
        gameStarted = true;
    });

    // t: current time, b: begInnIng value, c: change In value, d: duration
    var easeOutQuad = function(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    };

    var gameStarted = false,
        intervalTimes = 0,
        clickTimes = 0;
    var startGame = function() {
        var score = 500, //当前分数
            initScore = 500,
            maxScore = 8000, //最高分
            minScore = 0, //最低分
            totalSecond = 20, //游戏时间，单位为秒
            intervalTime = 1000, //更新指数的时间间隔，单位为毫秒 
            startDecreaseSpeed = 30, //游戏开始时下降速度
            endDecreaseSpeed = 50; //游戏结束时下降速度


        var startTime = undefined;
        var lastCalcTime = undefined;
        var lastScore = undefined;
        var w = $('.whiteboard .body').width();
        var h = $('.whiteboard .body').height();

        var totalH = h * maxScore / 1000;
        var totalW = w * totalSecond / 10;

        var svg = new Snap(totalW, totalH);
        $('.whiteboard .body').append(svg.node);

        //折现的开始点marker
        var markerStart = svg.paper.circle(2, 2, 2).attr({
            fill: "#ce5343"
        }).marker(0, 0, 4, 4, 2, 2);
        //折现的结束点marker
        var markerEnd = svg.paper.path("M0,0 L0,4 L4,2 L0,0").attr({
            fill: "#ce5343"
        }).marker(0, 0, 4, 4, 0, 2);
        var partW = w / (totalSecond * 1000 / intervalTime);

        //根据当前分数和时间计算点的位置
        function getPos(score, times) {
            return {
                x: 10 + totalW / (totalSecond * 1000 /intervalTime) * times,
                y: totalH - totalH * score / maxScore
            }
        }
        /**
         * score 当前分数
         * times 经过的次数
         * lastScore 上一次分数
         * decreaseScore 下降的分数
         * clickedTimes 用户点击的次数
         */
        function calcPath(increaseScore, times, lastScore, decreaseScore, clickedTimes) {
            //上一次计算分数时的点
            if(times == 0) {
                var pos1 = getPos(lastScore, 0);
                pos1.x = 10;
            } else {
                var pos1 = getPos(lastScore, times - 1);
            }
            //本次下降的分数点
            if (clickedTimes == 0) {
                var pos2 = getPos(lastScore - decreaseScore, times);
            } else {
                var pos2 = getPos(lastScore - decreaseScore, times - 0.5);
            }
            var pos3 = getPos(lastScore + increaseScore - decreaseScore, times);
            transformSvg2(pos1);
            return {
                start1: 'M' + pos1.x + ',' + pos1.y + 'L' + pos1.x + ',' + pos1.y,
                end1: 'M' + pos1.x + ',' + pos1.y + 'L' + pos2.x + ',' + pos2.y,
                start2: 'M' + pos2.x + ',' + pos2.y + 'L' + pos2.x + ',' + pos2.y,
                end2: 'M' + pos2.x + ',' + pos2.y + 'L' + pos3.x + ',' + pos3.y
            };
        }

        function transformSvg2(p) {
            var x,y;
            if(p.x < w / 2) {
                x = 0;
            } else if(p.x > totalW - w / 2) {
                x = w - totalW;
            } else {
                x = w / 2 - p.x;
            }

            if(p.y > totalH - h / 2) {
                y = h - totalH;
            } else if(p.y < h / 2) {
                y = 0;
            } else {
                y = h / 2 - p.y;
            }

            $('svg').css('transform', 'translate(' +  x + 'px, ' + y + 'px)');

        }

        function transformSvg(score, times) {
            var x, y;
            if(score < initScore) {
                y = totalH - h;
            }
            else if(score > maxScore - initScore) {
                y = 0;
            } else {
                y =  totalH - score / maxScore * totalH - score / 1000 * h;
            }

            //整个游戏过程中，绘制的次数
            var totalTimes = totalSecond * 1000 / intervalTime;
            //一屏宽度下可以绘制的次数
            var timesPerScreen = w / totalW * totalTimes;

            if( times < timesPerScreen / 2) {
                x = 0;
            } else if(times > totalTimes - timesPerScreen / 2) {
                x = totalW - w;
            } else {
                x = totalW / totalTimes * (times - 1 - timesPerScreen / 2);
            }

            $('svg').css('transform', 'translate(' + (-x) + 'px, ' + (- y) + 'px)');
        }

        function renderPath(paths) {
            var p1 = svg.paper.path(paths.start1).attr({
                stroke: "#ce5343",
                strokeWidth: 2,
                strokeLinecap: 'round'
                // markerEnd: markerEnd,
                // markerStart: markerStart
            });
            p1.animate({
                d: paths.end1
            }, intervalTime / 2);

            window.setTimeout(function() {
                var p2 = svg.paper.path(paths.start2).attr({
                    stroke: "#ce5343",
                    strokeWidth: 2,
                    strokeLinejoin: 'round'
                    // markerEnd: markerEnd,
                    // markerStart: markerStart
                });
                p2.animate({
                    d: paths.end2
                }, intervalTime / 2);
            }, intervalTime / 2);
        }

        var startPaths = calcPath(0, 0, initScore, 0, 0);

        renderPath(startPaths);



        function render(time) {
            if (!gameStarted) {
                return;
            }
            if (time === undefined)
                time = Date.now();
            if (startTime === undefined)
                startTime = time;
            if (lastCalcTime === undefined) {
                lastCalcTime = time;
            }

            if (time - lastCalcTime >= intervalTime) {
                intervalTimes++;
                var decreaseSpeed = easeOutQuad(null, time - startTime, startDecreaseSpeed, (endDecreaseSpeed - startDecreaseSpeed), totalSecond * 1000);

                console.log('点击了' + clickTimes + '次');
                console.log('应该下降' + decreaseSpeed + '点');

                lastCalcTime = time;

                if (lastScore == undefined) {
                    lastScore = score;
                }


                var decreaseScore = easeOutQuad(null, time - startTime, startDecreaseSpeed, (endDecreaseSpeed - startDecreaseSpeed), totalSecond * 1000);

                var paths = calcPath(clickTimes * 15, intervalTimes, lastScore, decreaseScore, clickTimes);
                score = score + clickTimes * 15 - decreaseScore;

                

                renderPath(paths);

                clickTimes = 0;
                lastScore = score;


                // var line = svg.paper.line(partW * (intervalTimes - 1), 1 / 2 * h, partW * (intervalTimes - 1), 1 / 2 * h).attr({
                //     stroke: "#ce5343",
                //     strokeWidth: 3
                // }).animate({
                //     x2: partW * intervalTimes
                // }, 500);
            }
        }

        (function animloop() {
            render();
            requestAnimationFrame(animloop);
        })();
    }
});
