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

    $('.share-guild').on('click', function(){
        hideShareGuild();
    });

    var showShareGuild = function() {
        showModal();
        $('.share-guild').show();
    };
    var hideShareGuild = function() {
        hideModal();
        $('.share-guild').hide();
    };
    //分享
    $('.share, .send').on('click', function(e) {
        e.preventDefault();
        showShareGuild();
    });
    $(document).on('click', '.modal-share', function() {
        hideShareGuild();
    });

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

    $('.collapse .toggle').click(function() {
        $(this).closest('.collapse').toggleClass('in');
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
        // $('.cd-progress .cd-progress-bar').css('animation-name', 'cd-progress');
        // $('.cd-progress .cd-progress-bar').css('animation-duration', totalSecond + 's');
    });

    $('.btn-again').on('click', function(e) {
        e.preventDefault();
        gameStarted = false;
        gameStoped = false;
        startTime = undefined;
        lastCalcTime = undefined;
        lastScore = undefined;
        score = 500;
        clickTimes = 0;
        intervalTimes = 0;

        $('.cd-progress .cd-progress-bar').css('transform', 'scale(1, 1)');
        $('.time').text(totalSecond + '.00');

        $('.result').hide();
        $('.game-playing').show();
        $('svg > path').remove();
        $('.copyright').hide();
        startGame();
    });



    // t: current time, b: begInnIng value, c: change In value, d: duration
    var easeOutQuad = function(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    };

    var gameStarted = false,
        gameStoped = false,
        intervalTimes = 0,
        clickTimes = 0;
    var totalSecond = 30; //游戏时间，单位为秒
    var startTime = undefined;
    var lastCalcTime = undefined;
    var lastScore = undefined;
    var score = 500;

    var startGame = function() {
        var
            initScore = 500,
            maxScore = 8000, //最高分
            minScore = 0, //最低分
            intervalTime = 500, //更新指数的时间间隔，单位为毫秒 

            increaseStepRange = [1, 200],
            startDecreaseSpeed = 50, //游戏开始时下降速度
            endDecreaseSpeed = 100, //游戏结束时下降速度
            decreaseSpeedRange = [100, 500];



        var w = $('.whiteboard .body').width();
        var h = $('.whiteboard .body').height();

        var scorePerH = 3000; // 当前显示板最多能包含多少分数
        var pixelPerScore = h / scorePerH;

        // var totalH = h * maxScore / 3000;
        var totalH = h * maxScore / scorePerH;
        var totalW = w * totalSecond / 10;

        var padding = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        };
        var svg = new Snap('#svg').attr({
            width: totalW + padding.left + padding.right,
            height: totalH + padding.top + padding.bottom
        });
        // var svg = new Snap(, totalH + padding.top + padding.bottom)
        // $('.whiteboard .body').append(svg.node);

        //折现的开始点marker
        var markerStart = svg.paper.circle(2, 2, 2).attr({
            fill: "#d87a6e"
        }).marker(0, 0, 4, 4, 2, 2).attr({
            'orient': 'auto'
        });
        //折现的结束点marker
        var markerEnd = svg.paper.circle(2, 2, 2).attr({
            fill: "#ce5343"
        }).marker(0, 0, 4, 4, 2, 2).attr({
            'orient': 'auto'
        });
        // var markerEnd = svg.paper.path("M0,0 L0,4 L4,2 L0,0").attr({
        //     fill: "#ce5343"
        // }).marker(0, 0, 4, 4, 0, 2);
        var partW = w / (totalSecond * 1000 / intervalTime);

        //根据当前分数和时间计算点的位置
        function getPos(score, times) {
            if (score < 0) {
                score = 0;
            }
            if (score > maxScore) {
                score = maxScore;
            }
            return {
                x: padding.left + (totalW - padding.left - padding.right) * times / (totalSecond * 1000 / intervalTime),
                // y: totalH - padding.top - padding.bottom - score / maxScore * (totalH - padding.top - padding.bottom)
                y: totalH - pixelPerScore * score + padding.top
            }
        }

        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
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
            if (times == 0) {
                var pos1 = getPos(lastScore, 0);
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
            var x, y;

            x = w / 2 - p.x;
            y = h / 2 - p.y;

            $('svg').css('transform', 'translate(' + x + 'px, ' + y + 'px)');

            return [x, y]
        }

        var lastP1, lastP2;

        function renderPath(paths) {
            if (lastP2) {
                lastP2.attr({
                    'markerEnd': null
                });
            }
            var p1 = svg.paper.path(paths.start1).attr({
                stroke: "#ce5343",
                strokeWidth: 2,
                strokeLinecap: 'round',
                markerEnd: markerEnd,
                markerStart: markerStart
            });
            p1.animate({
                d: paths.end1
            }, intervalTime / 2, function() {

            });

            lastP1 = p1;

            window.setTimeout(function() {
                p1.attr({
                    'markerEnd': null
                });
                var p2 = svg.paper.path(paths.start2).attr({
                    stroke: "#ce5343",
                    strokeWidth: 2,
                    strokeLinejoin: 'round',
                    'marker-end': markerEnd
                });
                p2.animate({
                    d: paths.end2
                }, intervalTime / 2);
                lastP2 = p2;
            }, intervalTime / 2);
        }

        renderPath(calcPath(0, 1, initScore, 0, 0));

        var $score = $('#score');
        $score.text(initScore);

        var decreaseScore = 0,
            increaseStep = 0;

        function render(time) {
            if (gameStarted && !gameStoped) {
                if (time === undefined)
                    time = Date.now();
                if (startTime === undefined)
                    startTime = time;
                if (lastCalcTime === undefined) {
                    lastCalcTime = time;
                }

                if (time - startTime >= totalSecond * 1000) {
                    gameStoped = true;
                    var sx = w / (totalW + padding.left + padding.right);
                    var sy = h / (totalH + padding.top + padding.bottom);
                    var x = -w - padding.left;
                    var y = -h;
                    $('svg').css('transform', 'translate3d(' + x + 'px,' + y + 'px,0) scale(' + sx + ', ' + sy + ')');

                    $('.copyright').fadeIn('normal');

                    $('.game-playing').fadeOut();
                    $('.result').removeClass('good normal bad fail');
                    if (score >= 5000) {
                        $('.result').addClass('good').fadeIn('slow');
                    }
                    if (score >= 3000 && score < 5000) {
                        $('.result').addClass('normal').fadeIn('slow');
                    }
                    if (score >= 1000 && score < 3000) {
                        $('.result').addClass('bad').fadeIn('slow');
                    }
                    if (score < 1000) {
                        $('.result').addClass('fail').fadeIn('slow');
                    }

                    return;
                }

                var remain = (totalSecond - (time - startTime) / 1000).toFixed(2);
                if (remain > 0 && remain < 10) {
                    remain = '0' + remain;
                }
                if (remain <= 0) {
                    remain = '00.00';
                }

                $('.cd-progress .cd-progress-bar').css('transform', 'scale(' + remain / totalSecond + ', 1)');

                $('.time').text(remain);

                if (time - lastCalcTime >= intervalTime) {
                    intervalTimes++;
                    var decreaseSpeed = easeOutQuad(null, time - startTime, startDecreaseSpeed, (endDecreaseSpeed - startDecreaseSpeed), totalSecond * 1000);

                    lastCalcTime = time;

                    if (lastScore == undefined) {
                        lastScore = score;
                    }

                    // var decreaseScore = easeOutQuad(null, time - startTime, startDecreaseSpeed, (endDecreaseSpeed - startDecreaseSpeed), totalSecond * 1000);
                    decreaseScore = getRandomArbitrary(decreaseSpeedRange[0], decreaseSpeedRange[1]);
                    increaseStep = getRandomArbitrary(increaseStepRange[0], increaseStepRange[1]);

                    if (lastScore == 0) {
                        var paths = calcPath(clickTimes * increaseStep, intervalTimes + 1, lastScore, 0, clickTimes);
                        score = score + clickTimes * increaseStep;
                    } else if (lastScore >= maxScore) {
                        var paths = calcPath(0, intervalTimes + 1, lastScore, decreaseScore, clickTimes);
                        score = score - decreaseScore;
                    } else {
                        var paths = calcPath(clickTimes * increaseStep, intervalTimes + 1, lastScore, decreaseScore, clickTimes);
                        score = score + clickTimes * increaseStep - decreaseScore;
                    }

                    if (score <= 0) {
                        score = 0;
                    } else if (score >= maxScore) {
                        score = maxScore;
                    }

                    renderPath(paths);

                    clickTimes = 0;
                    lastScore = score;

                    $score.text(score.toFixed(2));

                    // $score.text(Math.floor(easeOutQuad(null, time - lastCalcTime, lastScore == undefined ? initScore : lastScore, clickTimes * increaseStep - decreaseScore, intervalTime)));
                }
            }
        }

        (function animloop() {
            render();
            requestAnimationFrame(animloop);
        })();
    }
});
