$(function () {
    sm_calendar.getServerTime();
    sm_calendar.calendarInit(new Date(sm_calendar.todayTime));
});

function receiveMessage(event){
    var dataObj = event.data;
    if(dataObj.reload == 1){
        var year = $("#sm_calendar_inputYear").val();
        var month = $("#sm_calendar_inputMonth").val() - 1;
        sm_calendar.calendarInit(new Date(year, month));
    }
}

window.addEventListener('message', receiveMessage, false);

let sm_calendar = {
    todayTime: undefined,
    childPopup: undefined,
    krTime: 1000 * 60 * 60 * 9,
    getServerTime: function () {
        var calendarObj = this;
        $.ajax({
            url: "http://127.0.0.1:8080/getServerTime",
            method: "get",
            dataType: "json",
            async: false,
            success: function (result) {
                if (result.code == 1) {
                    var time = Number(result.time) * 1000 + calendarObj.krTime;
                    calendarObj.todayTime = time;
                }
            },
            error: function (err) {
                calendarObj.todayTime = 0;
            }
        });
    },
    calendarInit: function (date) {
        // 요소를 생성하기 위한 내부함수
        function setElement(elementName, attrObj, htmlVal) {
            var element = document.createElement(elementName);

            if (attrObj !== undefined) {
                for (var key in attrObj) {
                    element.setAttribute(key, attrObj[key]);
                }
            }

            if (htmlVal !== undefined && htmlVal !== "") {
                element.innerHTML = htmlVal;
            }

            return element;
        }

        function getCalendarList(endDay){
            var startUTCTime = new Date(nowYear, nowMonth-1, 1).getTime() - calendarObj.krTime;
            var endUTCTime = new Date(nowYear, nowMonth-1, endDay).getTime() - calendarObj.krTime;

            var returnValue;
            $.ajax({
                url: "http://127.0.0.1:8080/getCalendarList",
                method: "get",
                dataType: "json",
                async: false,
                data: {
                    startDate: startUTCTime,
                    endDate: endUTCTime
                },
                success: function (result) {
                    if (result.code == 1) {
                        for(var i=0; i<result.list.length; i++){
                            var temp = new Date(Number(result.list[i].startDate) + calendarObj.krTime);
                            result.list[i].startDate = {
                                year: temp.getFullYear(),
                                month: temp.getMonth() + 1,
                                day: temp.getDate()
                            }

                            temp = new Date(Number(result.list[i].endDate) + calendarObj.krTime)
                            result.list[i].endDate = {
                                year: temp.getFullYear(),
                                month: temp.getMonth() + 1,
                                day: temp.getDate()
                            }
                        }
                        returnValue = result.list;
                    }
                },
                error: function (err) {
                    console.log(err);
                    returnValue = null;
                }
            });
            return returnValue;
        }

        var calendarObj = this;
        var today = new Date(calendarObj.todayTime);
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth() + 1;
        var todayDay = today.getDate();

        var nowYear = date.getFullYear();
        var nowMonth = date.getMonth() + 1;
        var nowDay = date.getDate();
        const DAY_OF_WEEK = ['', '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const SOLAR_HOLIDAY = [
            {month: 1, day: 1, caption: "새해"},
            {month: 3, day: 1, caption: "삼일절"},
            {month: 5, day: 5, caption: "어린이날"},
            {month: 6, day: 6, caption: "현충일"},
            {month: 8, day: 15, caption: "광복절"},
            {month: 10, day: 3, caption: "개천절"},
            {month: 10, day: 9, caption: "한글날"},
            {month: 12, day: 25, caption: "크리스마스"},
        ];
        const LUNAR_HOLIDAY = [
            {month: 1, day: 1, caption: "설날"},
            {month: 4, day: 8, caption: "석가탄신일"},
            {month: 8, day: 15, caption: "추석"},
        ]

        var calDiv = document.getElementById("sm_calendar");
        var div = setElement("div", {"id": "sm_calendar_absoluteDiv"});
        var childDiv = setElement("div", {"id": "sm_calendar_childDiv"});
        div.appendChild(childDiv);

        childDiv = setElement("div", {"id": "sm_calendar_listBtnWrapper"});
        var btn = setElement("button", {"id": "sm_calendar_getListBtn"}, "보기");
        childDiv.appendChild(btn);
        btn = setElement("button", {"id": "sm_calendar_updateListBtn"}, "수정");
        childDiv.appendChild(btn);
        btn = setElement("button", {"id": "sm_calendar_deleteListBtn"}, "삭제");
        childDiv.appendChild(btn);
        btn = setElement("button", {"id": "sm_calendar_closeListBtn"}, "닫기");
        childDiv.appendChild(btn);
        div.appendChild(childDiv);
        calDiv.appendChild(div);

        var table = document.getElementById("sm_calendar_table");
        if (table !== null) {
            calDiv.removeChild(table);
        }
        var table = setElement("table", { "id": "sm_calendar_table" });

        // 열 너비조정
        var colgroup = document.createElement("colgroup");
        var firstCol = document.createElement("col");
        firstCol.style.width = "40px";
        colgroup.appendChild(firstCol);
        for (var i = 0; i < 7; i++) {

            var otherCol = document.createElement("col");
            otherCol.style.width = "calc(14.2% - 40px)";
            colgroup.appendChild(otherCol);
        }
        table.appendChild(colgroup);

        // 버튼 행 생성
        var tr = document.createElement("tr");
        var td = setElement("td", { "colspan": "8", "id": "sm_calendar_manage_row" });
        btn = setElement("button", { "id": "sm_calendar_todayBtn" }, "Today");
        td.appendChild(btn);

        btn = setElement("button", { "class": "sm_calendar_calBtn" }, "<<");
        td.appendChild(btn);
        btn = setElement("button", { "class": "sm_calendar_calBtn" }, "<");
        td.appendChild(btn);

        var select = setElement("select", { "id": "sm_calendar_inputYear" });
        for (var i = nowYear + 5; i >= nowYear - 5; i--) {
            var option;
            if (i == nowYear) option = setElement("option", { "value": i, "selected": true }, i);
            else option = setElement("option", { "value": i }, i);
            select.appendChild(option);
        }
        td.appendChild(select);
        var span = setElement("span", {}, "년");
        td.appendChild(span);

        select = setElement("select", { "id": "sm_calendar_inputMonth" });
        for (var i = 1; i <= 12; i++) {
            var option;
            if (i == nowMonth) option = setElement("option", { "value": i, "selected": true }, i);
            else option = setElement("option", { "value": i }, i);
            select.appendChild(option);
        }
        td.appendChild(select);
        span = setElement("span", {}, "월");
        td.appendChild(span);

        btn = setElement("button", { "class": "sm_calendar_calBtn" }, ">");
        td.appendChild(btn);
        btn = setElement("button", { "class": "sm_calendar_calBtn" }, ">>");
        td.appendChild(btn);
        tr.appendChild(td);
        table.appendChild(tr);

        // 요일 행 생성
        tr = setElement("tr", { "class": "sm_calendar_dayOfWeek" });
        for (var i = 0; i < DAY_OF_WEEK.length; i++) {
            td = setElement("td", {}, DAY_OF_WEEK[i]);
            tr.appendChild(td);
        }
        table.appendChild(tr);

        // 달력의 날짜 생성 부분
        var firstDay = new Date(nowYear, nowMonth - 1, 1);
        var lastDay = new Date(nowYear, nowMonth, 0);
        var nowLastDay = lastDay.getDate();
        var firstDOW = firstDay.getDay();
        
        var calendarList = getCalendarList(nowLastDay);

        var weekCount = 1;
        tr = setElement("tr", { "class": "sm_calendar_date_row" });
        td = setElement("td", { "class": "sm_calendar_weekCount" }, (weekCount++ + '주'));
        tr.appendChild(td);

        var dateIdx = 0;
        // 시작 요일이 일요일이 아니면 저번달의 마지막주 표시
        if (firstDOW != 0) {
            var beforeMonth = new Date(nowYear, nowMonth - 1, 0);
            var lastWeekDay = beforeMonth.getDate();
            var lastWeekhDOW = beforeMonth.getDay();

            for (var i = lastWeekhDOW; i >= 0; i--) {
                td = setElement("td", { "class": "sm_calendar_lastNextCaption" });
                div = setElement("div", {}, lastWeekDay - i);
                td.appendChild(div);
                tr.appendChild(td);
                dateIdx++;
            }
        }
        console.log(calendarList);
        // 달력 표시
        for (var i = 1; i <= nowLastDay; i++) {
            var lunDate = calendarObj.solarToLunar(nowYear, nowMonth, i);

            if (todayYear == nowYear && todayMonth == nowMonth && todayDay == i)
                td = setElement("td", { "class": "sm_calendar_date sm_calendar_today" });
            else
                td = setElement("td", { "class": "sm_calendar_date" });

            div = setElement("div", { "class": "sm_calendar_dateTitle" });
            span = setElement("span", {}, i);
            div.appendChild(span);
            span = setElement("span", {}, lunDate);
            div.appendChild(span);
            td.appendChild(div);

            for(var j=0; j<calendarList.length; j++){
                if( (calendarList[j].endDate.year > nowYear &&
                    calendarList[j].startDate.day <= i) ||

                    (calendarList[j].endDate.month > nowMonth &&
                    calendarList[j].startDate.day <= i) ||

                    (calendarList[j].startDate.month == nowMonth &&
                    calendarList[j].endDate.month == nowMonth &&
                    calendarList[j].startDate.day <= i &&
                    calendarList[j].endDate.day >= i) ||

                    (calendarList[j].startDate.month < nowMonth &&
                    calendarList[j].endDate.month == nowMonth &&
                    calendarList[j].endDate.day >= i)){

                    div = setElement("div", {"class": "sm_calendar_dateList"});
                    var input = setElement("input", {"type": "hidden", "value": calendarList[j].idx, "class": "sm_calendar_listIdx"});
                    div.appendChild(input);
                    span = setElement("span", {"class": "sm_calendar_listTitle"}, calendarList[j].title);
                    div.appendChild(span);
                    if(calendarList[j].location != ""){
                        span = setElement("span", {"class": "sm_calendar_listLocation"}, " (" + calendarList[j].location + ")");
                        div.appendChild(span);
                    }
                    td.appendChild(div);
                }
            }

            tr.appendChild(td);

            dateIdx++;
            if (dateIdx >= 7) {
                dateIdx = 0;
                if (i == nowLastDay) break;
                else {
                    table.appendChild(tr);
                    tr = setElement("tr", { "class": "sm_calendar_date_row" });
                    td = setElement("td", { "class": "sm_calendar_weekCount" }, weekCount++ + "주");
                    tr.appendChild(td);
                }
            }
        }

        // 이번달 마지막 요일이 토요일이 아니면 다음달의 첫번째 주 표시
        if (dateIdx != 0) {
            var nextMonth = new Date(nowYear, nowMonth, 1);
            var nextWeekDOW = nextMonth.getDay();
            var nextWeekFirstDay = 1;
            for (var i = nextWeekDOW; i <= 6; i++) {
                td = setElement("td", { "class": "sm_calendar_lastNextCaption" });
                div = setElement("div", {}, nextWeekFirstDay++);
                td.appendChild(div);
                tr.appendChild(td);
            }
        }
        table.appendChild(tr);
        calDiv.appendChild(table);

        // 달력 변환 함수
        function changeCalendar(obj) {
            var year = $("#sm_calendar_inputYear").val();
            var month = $("#sm_calendar_inputMonth").val() - 1;

            if (obj !== undefined) {
                var btnVal = $(obj).text();

                if (btnVal == '<') {
                    if (month == 0) {
                        month = 11;
                        year -= 1;
                    } else {
                        month--;
                    }

                } else if (btnVal == '>') {
                    if (month == 12) {
                        month == 0;
                        year += 1;
                    } else {
                        month++;
                    }

                } else if (btnVal == '<<') {
                    year--;

                } else if (btnVal == '>>') {
                    year++;
                }
            }
            calendarObj.calendarInit(new Date(year, month));
        }

        // 날짜 클릭 시 새창 함수
        function setCalendar(type, day) {
            var size;
            if(type == 1 || type == 3){
                size = "width=820px, height=700px";
            }else{
                size = "width=820px, height=600px";
            }
            calendarObj.childPopup = window.open("setCalendar.html", "childForm", size);
            var repeat = setInterval(function(){
                if(calendarObj.childPopup !== undefined){
                    calendarObj.childPopup.postMessage(
                        {type: type,
                        rdata: {year: nowYear,
                                month: nowMonth,
                                day: day}
                        },
                        'http://127.0.0.1:5500/calendar/setCalendar.html');
                    clearInterval(repeat);
                }
            }, 300);
        }
        
        $(".sm_calendar_calBtn").on("click", function () {
            changeCalendar(this);
        });
        $("#sm_calendar_inputYear").on("change", function () {
            changeCalendar();
        });
        $("#sm_calendar_inputMonth").on("change", function () {
            changeCalendar();
        });
        $(".sm_calendar_dateTitle").on("dblclick", function () {
            var obj = this;
            var inputDay = $(obj).children("span:first-child").text();
            setCalendar(2, inputDay);
        });
        $(".sm_calendar_dateList").on("click", function(event){
            var obj = this;
            var title = $(obj).children(".sm_calendar_listTitle").text();
            var location = $(obj).children(".sm_calendar_listLocation").text();

            $("#sm_calendar_absoluteDiv").css("visibility", "visible");
            console.log(event);
            console.log(title, location);

        });

    },
    lunarCalc: function (year, month, day, type, leapmonth) {
        const LAST_LUNAR_YEAR = 1969;
        var lunarMonthTable = [
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 양력 1970년 1월은 음력 1969년에 있음 그래서 시작년도는 1969년*/
            [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
            [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
            [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
            [2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
            [2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
            [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
            [2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
            [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
            [1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
            [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
            [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
            [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
            [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
            [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
            [2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
            [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
            [1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1],
            [2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
            [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
            [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
            [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
            [2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
            [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
            [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
            [2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
            [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
            [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
            [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   /* 2021 */
            [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
            [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
            [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
            [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
            [1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
            [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
            [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
            [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 2031 */
            [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
            [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
            [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
            [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
            [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
            [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
            [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
            [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   /* 2041 */
            [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
            [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2]];

        // 음력 계산을 위한 객체
        function myDate(year, month, day, leapMonth) {
            this.year = year;
            this.month = month;
            this.day = day;
            this.leapMonth = leapMonth;
        }

        var solYear, solMonth, solDay;
        var lunYear, lunMonth, lunDay;

        // lunLeapMonth는 음력의 윤달인지 아닌지를 확인하기위한 변수
        // 1일 경우 윤달이고 0일 경우 음달
        var lunLeapMonth, lunMonthDay;
        var lunIndex;

        var solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        /* range check */
        if (year < 1970 || year > 2040) {
            // alert('1970년부터 2040년까지만 지원합니다');
            return "";
        }

        /* 속도 개선을 위해 기준 일자를 여러개로 한다 */
        if (year >= 2030) {
            /* 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일) */
            solYear = 2030;
            solMonth = 1;
            solDay = 1;
            lunYear = 2029;
            lunMonth = 11;
            lunDay = 28;
            lunLeapMonth = 0;

            solMonthDay[1] = 28;    /* 2030 년 2월 28일 */
            lunMonthDay = 30;   /* 2029년 11월 */
        }
        else if (year >= 2000) {
            /* 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일) */
            solYear = 2000;
            solMonth = 1;
            solDay = 1;
            lunYear = 1999;
            lunMonth = 11;
            lunDay = 25;
            lunLeapMonth = 0;

            solMonthDay[1] = 29;    /* 2000 년 2월 28일 */
            lunMonthDay = 30;   /* 1999년 11월 */
        }
        else {
            /* 기준일자 양력 1970년 1월 1일 (음력 1969년 11월 24일) */
            solYear = 1970;
            solMonth = 1;
            solDay = 1;
            lunYear = 1969;
            lunMonth = 11;
            lunDay = 24;
            lunLeapMonth = 0;

            solMonthDay[1] = 28;    /* 1970 년 2월 28일 */
            lunMonthDay = 30;   /* 1969년 11월 */
        }

        lunIndex = lunYear - LAST_LUNAR_YEAR;

        // type이 1일때는 입력받은 양력 값에 대한 음력값을 반환
        // 2일 때는 입력받은 음력 값에 대한 양력값을 반환
        // 반복문이 돌면서 양력 값들과 음력 값들을 1일 씩 증가시키고
        // 입력받은 날짜값과 양력 값이 일치할 때 음력값을 반환함
        while (true) {
            if (type == 1 &&
                year == solYear &&
                month == solMonth &&
                day == solDay) {
                return new myDate(lunYear, lunMonth, lunDay, lunLeapMonth);
            }
            else if (type == 2 &&
                year == lunYear &&
                month == lunMonth &&
                day == lunDay &&
                leapmonth == lunLeapMonth) {
                return new myDate(solYear, solMonth, solDay, 0);
            }
            // 양력의 마지막 날일 경우 년도를 증가시키고 나머지 초기화
            if (solMonth == 12 && solDay == 31) {
                solYear++;
                solMonth = 1;
                solDay = 1;

                // 윤년일 시 2월달의 총 일수를 1일 증가
                if (solYear % 400 == 0)
                    solMonthDay[1] = 29;
                else if (solYear % 100 == 0)
                    solMonthDay[1] = 28;
                else if (solYear % 4 == 0)
                    solMonthDay[1] = 29;
                else
                    solMonthDay[1] = 28;

            }
            // 현재 날짜가 달의 마지막 날짜를 가리키고 있을 시 달을 증가시키고 날짜 1로 초기화
            else if (solMonthDay[solMonth - 1] == solDay) {
                solMonth++;
                solDay = 1;
            }
            else
                solDay++;

            // 음력의 마지막 날인 경우 년도를 증가시키고 달과 일수를 초기화
            if (lunMonth == 12 &&
                ((lunarMonthTable[lunIndex][lunMonth - 1] == 1 && lunDay == 29) ||
                    (lunarMonthTable[lunIndex][lunMonth - 1] == 2 && lunDay == 30))) {
                lunYear++;
                lunMonth = 1;
                lunDay = 1;

                if (lunYear > 2043) {
                    alert("입력하신 달은 없습니다.");
                    break;
                }

                // 년도가 바꼈으니 index값 수정
                lunIndex = lunYear - LAST_LUNAR_YEAR;

                // 음력의 1월에는 1 or 2만 있으므로 1과 2만 비교하면됨
                if (lunarMonthTable[lunIndex][lunMonth - 1] == 1)
                    lunMonthDay = 29;
                else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2)
                    lunMonthDay = 30;
            }
            // 현재날짜가 이번달의 마지막날짜와 일치할 경우
            else if (lunDay == lunMonthDay) {

                // 윤달인데 윤달계산을 안했을 경우 달의 숫자는 증가시키면 안됨
                if (lunarMonthTable[lunIndex][lunMonth - 1] >= 3
                    && lunLeapMonth == 0) {
                    lunDay = 1;
                    lunLeapMonth = 1;
                }
                // 음달이거나 윤달을 계산 했을 겨우 달을 증가시키고 lunLeapMonth값 초기화
                else {
                    lunMonth++;
                    lunDay = 1;
                    lunLeapMonth = 0;
                }

                // 음력의 달에 맞는 마지막날짜 초기화
                if (lunarMonthTable[lunIndex][lunMonth - 1] == 1)
                    lunMonthDay = 29;
                else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2)
                    lunMonthDay = 30;
                else if (lunarMonthTable[lunIndex][lunMonth - 1] == 3)
                    lunMonthDay = 29;
                else if (lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
                    lunLeapMonth == 0)
                    lunMonthDay = 29;
                else if (lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
                    lunLeapMonth == 1)
                    lunMonthDay = 30;
                else if (lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
                    lunLeapMonth == 0)
                    lunMonthDay = 30;
                else if (lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
                    lunLeapMonth == 1)
                    lunMonthDay = 29;
                else if (lunarMonthTable[lunIndex][lunMonth - 1] == 6)
                    lunMonthDay = 30;
            }
            else
                lunDay++;
        }
    },
    solarToLunar: function (solYear, solMonth, solDay) {
        const SOLAR_TO_LUNAR = 1;
        const LUNAR_TO_SOLAR = 2;

        // 날짜 형식이 안맞을 경우 공백 반환
        if (!solYear || solYear == 0 ||
            !solMonth || solMonth == 0 ||
            !solDay || solDay == 0) {
            return "";
        }

        /* 양력/음력 변환 */
        var date = this.lunarCalc(solYear, solMonth, solDay, SOLAR_TO_LUNAR);

        // 음력 배열의 범위를 초과하면 공백 반환
        if (date == undefined || date == "" || date == null)
            return "";
        else
            return (date.leapMonth ? " (윤" : " (") + date.month + "." + date.day + ")";

    }
}