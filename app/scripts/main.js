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
        intervalTimes = 1,
        clickTimes = 0;
    var startGame = function() {
        var score = 500, //当前分数
            maxScore = 8000, //最高分
            minScore = 0, //最低分
            totalSecond = 30, //游戏时间，单位为秒
            intervalTime = 1000, //更新指数的时间间隔，单位为毫秒 
            startDecreaseSpeed = 50,
            endDecreaseSpeed = 100;

        var startTime = undefined;
        var lastCalcTime = undefined;
        var w = $('.whiteboard .body').width();
        var h = $('.whiteboard .body').height();
        var svg = new Snap(w, h);
        $('.whiteboard .body').append(svg.node);
        var c1 = svg.paper.circle(5, 5, 3);
        var p1 = svg.paper.path("M2,2 L2,11 L10,6 L2,2").attr({
            fill: "#000"
        });
        var m1 = c1.marker(0, 0, 8, 8, 5, 5),
            m2 = p1.marker(0, 0, 13, 13, 2, 6);
        var partW = w / (totalSecond * 1000 / intervalTime);
        // var t1 = svg.paper.line(0, 2 / 3 * h, partW * intervalTimes, 2 / 3 * h).attr({
        //     stroke: "#ce5343",
        //     strokeWidth: 3
        // });

        var pathStr = 'M' + 0 + ',' + 2 / 3 * h + 'L' + +0 + ',' + 2 / 3 * h;
        var p = svg.paper.path(pathStr).attr({
            stroke: "#000",
            strokeWidth: 5,
            markerEnd: m2,
            markerStart: m1
        });
        pathStr = 'M' + 0 + ',' + 2 / 3 * h + 'L' + partW * 20 + ',' + 2 / 3 * h;
        p.animate({
            d: pathStr
        }, 1000);

        
        

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
                clickTimes = 0;
                lastCalcTime = time;
                // var line = svg.paper.line(partW * (intervalTimes - 1), 2 / 3 * h, partW * (intervalTimes - 1), 2 / 3 * h).attr({
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
