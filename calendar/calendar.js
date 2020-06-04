$(function () {
    sm_calendar.getServerTime();
    sm_calendar.calendarInit(new Date(sm_calendar.todayTime));
});

let sm_calendar = {
    todayTime: undefined,
    childPopup: undefined,
    getServerTime: function () {
        var calendarObj = this;
        $.ajax({
            url: "http://127.0.0.1:8080/getServerTime",
            method: "get",
            dataType: "json",
            async: false,
            success: function (result) {
                if (result.code == 1) {
                    var time = Number(result.time) * 1000
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

        var calendarObj = this;
        var today = new Date(calendarObj.todayTime);
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth() + 1;
        var todayDay = today.getDate();

        var nowYear = date.getFullYear();
        var nowMonth = date.getMonth() + 1;
        var nowDay = date.getDate();
        var DAY_OF_WEEK = ['', '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

        var div;
        var calDiv = document.getElementById("sm_calendar");
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
        var btn = setElement("button", { "id": "sm_calendar_todayBtn" }, "Today");
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
        function setCalendar(callBack) {
            calendarObj.childPopup = window.open("setCalendar.html", "childForm", "width=960px, height=720px");
            callBack();
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
            setCalendar(function () {
                var inputDay = $(obj).children("span:first-child").text();
                calendarObj.childPopup.postMessage({parentData: 'test parent data'}, 'setCalendar.html');
                // console.log(inputDay);
                // console.log(calendarObj.childPopup);
                // calendarObj.childPopup.document.getElementById("year").value = nowYear;
                // calendarObj.childPopup.document.getElementById("month").value = nowMonth;
                // calendarObj.childPopup.document.getElementById("day").value = inputDay;
            });
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
// 전역변수 선언 부분
// 현재 날짜
// let g_today = new Date();

// // 달력의 첫째열이 주차를 나타내므로 빈 공백으로 생성
// const DAY_OF_WEEK = ['', '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// // 테스트 json
// let g_testObj = {
//     msg: "success",
//     dataArr: [
//         { date: "20200515", caption: "만기", amount: "19", headCount: "37", balance: "324" },
//         { date: "20200515", caption: "만기", amount: "11", headCount: "23", balance: "8" },
//         { date: "20200515", caption: "만기", amount: "13", headCount: "4", balance: "31" },
//         { date: "20200515", caption: "만기", amount: "7", headCount: "11", balance: "53" },
//         { date: "20200520", caption: "만기", amount: "32", headCount: "53", balance: "6" },
//         { date: "20200520", caption: "만기", amount: "32", headCount: "53", balance: "1001" },
//         { date: "20200530", caption: "만기", amount: "1", headCount: "63", balance: "10" },
//         { date: "20201001", caption: "만기", amount: "5", headCount: "21", balance: "12" },
//         { date: "20201231", caption: "만기", amount: "87", headCount: "9", balance: "152" },
//         { date: "20200430", caption: "만기", amount: "18", headCount: "33", balance: "120" }
//     ]
// };

// // 공휴일 테스트용 json
// let g_holidays = {
//     msg: "success",
//     dataArr: [
//         { date: "20200101", caption: "새해" },
//         { date: "20200124", caption: "설날" },
//         { date: "20200125", caption: "설날" },
//         { date: "20200126", caption: "설날" },
//         { date: "20200301", caption: "삼일절" },
//         { date: "20200430", caption: "부처님 오신 날" },
//         { date: "20200505", caption: "어린이날" },
//         { date: "20200606", caption: "현충일" },
//         { date: "20200815", caption: "광복절" },
//         { date: "20200930", caption: "추석" },
//         { date: "20201001", caption: "추석" },
//         { date: "20201002", caption: "추석" },
//         { date: "20201003", caption: "개천절" },
//         { date: "20201009", caption: "한글날" },
//         { date: "20201225", caption: "크리스마스" },
//     ]
// };

// // 로드 함수 시 오늘날짜로 달력 생성
// $(function () {
//     calendarInit(g_today);
// })

// // 달력 초기화 함수
// // param = Date object
// function calendarInit(date) {
//     var nowYear = date.getFullYear();
//     var nowMonth = date.getMonth() + 1;

//     var html =
//         '<colgroup>' +
//         '<col style="width: 50px;">' +
//         '<col style="width: calc(14.2% - 50px);">' +
//         '<col style="width: calc(14.2% - 50px);">' +
//         '<col style="width: calc(14.2% - 50px);">' +
//         '<col style="width: calc(14.2% - 50px);">' +
//         '<col style="width: calc(14.2% - 50px);">' +
//         '<col style="width: calc(14.2% - 50px);">' +
//         '<col style="width: calc(14.2% - 50px);">' +
//         '</colgroup>' +
//         '<tr>' +
//         '<td colspan="8" id="manage-row">' +
//         '<button id="todayBtn" onclick="calendarInit(g_today);">Today</button>' +
//         '<button class="calBtn" onclick="changeCalendar(this);">&lt;&lt;</button>' +
//         '<button class="calBtn" onclick="changeCalendar(this);">&lt;</button>' +
//         '<select name="year" id="inputYear" onchange="changeCalendar();">';
//     for (var i = nowYear + 3; i >= nowYear - 3; i--) {
//         html += '<option value=' + i;
//         if (i == nowYear) html += ' selected';
//         html += '>' + i + '</option>';
//     }
//     html +=
//         '</select>년&nbsp;&nbsp;' +
//         '<select name="month" id="inputMonth" onchange="changeCalendar();">';
//     for (var i = 1; i <= 12; i++) {
//         html += '<option value=' + i;
//         if (i == nowMonth) html += ' selected';
//         html += '>' + i + '</option>';
//     }
//     html +=
//         '</select>월' +
//         '<button class="calBtn" onclick="changeCalendar(this);">&gt;</button>' +
//         '<button class="calBtn" onclick="changeCalendar(this);">&gt;&gt;</button>' +
//         '</td>' +
//         '</tr>' +
//         '<tr>';
//     // '요일' 생성 반복문
//     for (var i = 0; i < DAY_OF_WEEK.length; i++) {
//         html += '<td>' + DAY_OF_WEEK[i] + '</td>';
//     }
//     html += '</tr>';

//     // 달력의 날짜 생성 부분
//     var firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
//     var lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
//     var firstDay = firstDate.getDay();

//     var weekCount = 1; // '주차' 표시용 변수
//     html += '<tr class="date-row">' +
//         '<td class="weekCount">' + weekCount++ + '주</td>';

//     // 지난달의 마지막주 출력 부분
//     var dateIdx = 0;
//     if (firstDay != 0) {
//         var dateArr = getLastWeek(date);
//         for (var i = 0; i < firstDay; i++) {
//             html += '<td class="lastNextCaption">' + dateArr[i] + '</td>';
//             dateIdx++;
//         }
//     }

//     // 외부 json에 대한 처리
//     let objArr = [];
//     for (var i = 0; i < g_testObj.dataArr.length; i++) {
//         var dateObj = dateFormatter(g_testObj.dataArr[i].date);
//         if (dateObj != null && nowYear == dateObj.year && nowMonth == dateObj.month) {
//             objArr.push(g_testObj.dataArr[i]);
//         }
//     }

//     // 공휴일에 대한 처리
//     let holidayArr = [];
//     for (var i = 0; i < g_holidays.dataArr.length; i++) {
//         var dateObj = dateFormatter(g_holidays.dataArr[i].date);
//         if (dateObj != null && nowYear == dateObj.year && nowMonth == dateObj.month) {
//             holidayArr.push(g_holidays.dataArr[i]);
//         }
//     }

//     for (var i = firstDate.getDate(); i <= lastDate.getDate(); i++) {
//         var addCaption = '';
//         var count = 0;

//         // 외부 데이터가 있을 시 처리
//         objArr.forEach(function (item, idx) {
//             var dateObj = dateFormatter(item.date);
//             if (dateObj.date == i) {
//                 if (count >= 3) {
//                     addCaption += '<div class="moreInfo">. . .</div>';
//                     return;
//                 }

//                 addCaption +=
//                     '<div>' +
//                     '<span>' + item.caption + '</span>&nbsp;' +
//                     '<span>' + item.amount + '개/ ' + item.headCount + '명/ ' + item.balance + '억원</span>' +
//                     '</div>';
//                 count++;
//             }
//         });

//         var holidayClass = '';
//         var holidayCaption = '';
//         // 공휴일이 있을 시 처리
//         holidayArr.forEach(function (item, idx) {
//             var dateObj = dateFormatter(item.date);
//             if (dateObj.date == i) {
//                 holidayClass = ' holiday';
//                 holidayCaption += ' ' + item.caption;
//                 return;
//             }
//         });

//         // 음력 계산
//         var lunDate = solarToLunar(nowYear, nowMonth, i);

//         html += '<td class="date';
//         // 오늘날짜시 클래스 추가되게 처리
//         if (g_today.getFullYear() == nowYear
//             && g_today.getMonth() + 1 == nowMonth
//             && g_today.getDate() == i) {

//             html += ' todayBGColor'
//         }
//         html += holidayClass + '" onclick="detailDate(this);">' + i
//             + lunDate + holidayCaption + addCaption + '</td>';

//         dateIdx++;
//         if (dateIdx >= 7) {
//             dateIdx = 0;
//             if (i == lastDate.getDate()) break;
//             html += '</tr><tr class="date-row">';
//             html += '<td class="weekCount">' + weekCount++ + '주</td>';
//         }
//     }

//     if (dateIdx != 0) {
//         var dateArr = getNextWeek(date);
//         for (var i = dateIdx; i < 7; i++) {
//             html += '<td class="lastNextCaption">' + dateArr[i] + '</td>';
//             dateIdx++; 7
//         }
//     }
//     html += '</tr>';

//     $("#calendar-table").html(html);
// }

// // 달력에서 지난달의 마지막주 일차를 나타내기위해 값을 얻어오는 함수
// function getLastWeek(date) {
//     var beforeMonth = new Date(date.getFullYear(), date.getMonth(), 0);
//     var lastDate = beforeMonth.getDate();
//     var lastDay = beforeMonth.getDay();
//     var dateArr = [];

//     for (var i = lastDay; i >= 0; i--) {
//         dateArr.push(lastDate - i);
//     }

//     return dateArr;
// }

// // 달력에서 다음달의 첫번째주 일차를 나타내기위해 값을 얻어오는 함수
// function getNextWeek(date) {
//     var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
//     var firstDate = 1;
//     var firstDay = nextMonth.getDay();
//     var dateArr = [0, 0, 0, 0, 0, 0, 0];

//     for (var i = firstDay; i <= 6; i++) {
//         dateArr[i] = firstDate++;
//     }

//     return dateArr;
// }

// // 버튼, 셀렉박스 클릭 또는 값 변경 시 이벤트핸들러
// function changeCalendar(obj) {
//     var year = $("#inputYear").val();
//     var month = $("#inputMonth").val() - 1;

//     if (obj !== undefined) {
//         var btnVal = $(obj).text();

//         if (btnVal == '<') {
//             if (month == 0) {
//                 month = 11;
//                 year -= 1;
//             } else {
//                 month--;
//             }

//         } else if (btnVal == '>') {
//             if (month == 12) {
//                 month == 0;
//                 year += 1;
//             } else {
//                 month++;
//             }

//         } else if (btnVal == '<<') {
//             year--;

//         } else if (btnVal == '>>') {
//             year++;
//         }
//     }
//     calendarInit(new Date(year, month));
// }

// // 8byte 문자열로 작성된 날짜값 number로 데이터 타입 변환 후 객체로 반환
// function dateFormatter(strDate) {
//     if (strDate.length != 8) {
//         return null;
//     }

//     var year = Number(strDate.slice(0, 4));
//     var month = Number(strDate.slice(4, 6));
//     var date = Number(strDate.slice(6, 8));

//     return { "year": year, "month": month, "date": date };
// }

// // 날짜 상세조회
// function detailDate(obj) {
//     window.open("detail.html", "detail", "width=960px, height=720px");
// }

// /*  음력 달력 배열
//     음력은 모든 달이 29일 ~ 30일 으로만 이루어짐
//     음력에도 윤달이 있을 경우 2월에 1일이 추가되는 식이 아니라
//     한달이 추가되어짐
//     1-> 29일, 2->30일
//     3, 4, 5, 6은 윤달이 추가로 생성됨
//     3-> 29일 + 윤29일, 4-> 29일 + 윤30일
//     5-> 30일 + 윤29일, 6-> 30일 + 윤30일
// */
// const LAST_LUNAR_YEAR = 1969;
// const SOLAR_TO_LUNAR = 1;
// const LUNAR_TO_SOLAR = 2;
// var lunarMonthTable = [
//     [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 양력 1970년 1월은 음력 1969년에 있음 그래서 시작년도는 1969년*/
//     [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
//     [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2],   /* 1971 */
//     [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
//     [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
//     [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
//     [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
//     [2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
//     [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
//     [2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
//     [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
//     [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
//     [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],   /* 1981 */
//     [2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
//     [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
//     [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
//     [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
//     [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
//     [2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
//     [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
//     [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
//     [1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2],
//     [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],   /* 1991 */
//     [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
//     [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
//     [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
//     [1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
//     [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
//     [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
//     [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
//     [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
//     [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
//     [2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2],   /* 2001 */
//     [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
//     [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
//     [1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
//     [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 1],
//     [2, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
//     [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
//     [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
//     [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
//     [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
//     [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],   /* 2011 */
//     [2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
//     [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
//     [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
//     [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 1],
//     [2, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
//     [2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
//     [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
//     [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
//     [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
//     [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],   /* 2021 */
//     [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
//     [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
//     [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
//     [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
//     [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
//     [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
//     [1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
//     [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
//     [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
//     [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1],   /* 2031 */
//     [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
//     [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 5, 2],
//     [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
//     [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
//     [2, 2, 1, 2, 1, 4, 1, 1, 2, 2, 1, 2],
//     [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
//     [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
//     [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
//     [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
//     [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],   /* 2041 */
//     [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
//     [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2]];

// // 음력 계산을 위한 객체
// function myDate(year, month, day, leapMonth) {
//     this.year = year;
//     this.month = month;
//     this.day = day;
//     this.leapMonth = leapMonth;
// }

// // 양력을 음력으로 계산
// function lunarCalc(year, month, day, type, leapmonth) {
//     var solYear, solMonth, solDay;
//     var lunYear, lunMonth, lunDay;

//     // lunLeapMonth는 음력의 윤달인지 아닌지를 확인하기위한 변수
//     // 1일 경우 윤달이고 0일 경우 음달
//     var lunLeapMonth, lunMonthDay;
//     var lunIndex;

//     var solMonthDay = [31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

//     /* range check */
//     if (year < 1970 || year > 2040) {
//         // alert('1970년부터 2040년까지만 지원합니다');
//         return "";
//     }

//     /* 속도 개선을 위해 기준 일자를 여러개로 한다 */
//     if (year >= 2030) {
//         /* 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일) */
//         solYear = 2030;
//         solMonth = 1;
//         solDay = 1;
//         lunYear = 2029;
//         lunMonth = 11;
//         lunDay = 28;
//         lunLeapMonth = 0;

//         solMonthDay[1] = 28;    /* 2030 년 2월 28일 */
//         lunMonthDay = 30;   /* 2029년 11월 */
//     }
//     else if (year >= 2000) {
//         /* 기준일자 양력 2000년 1월 1일 (음력 1999년 11월 25일) */
//         solYear = 2000;
//         solMonth = 1;
//         solDay = 1;
//         lunYear = 1999;
//         lunMonth = 11;
//         lunDay = 25;
//         lunLeapMonth = 0;

//         solMonthDay[1] = 29;    /* 2000 년 2월 28일 */
//         lunMonthDay = 30;   /* 1999년 11월 */
//     }
//     else {
//         /* 기준일자 양력 1970년 1월 1일 (음력 1969년 11월 24일) */
//         solYear = 1970;
//         solMonth = 1;
//         solDay = 1;
//         lunYear = 1969;
//         lunMonth = 11;
//         lunDay = 24;
//         lunLeapMonth = 0;

//         solMonthDay[1] = 28;    /* 1970 년 2월 28일 */
//         lunMonthDay = 30;   /* 1969년 11월 */
//     }

//     lunIndex = lunYear - LAST_LUNAR_YEAR;

//     // type이 1일때는 입력받은 양력 값에 대한 음력값을 반환
//     // 2일 때는 입력받은 음력 값에 대한 양력값을 반환
//     // 반복문이 돌면서 양력 값들과 음력 값들을 1일 씩 증가시키고
//     // 입력받은 날짜값과 양력 값이 일치할 때 음력값을 반환함
//     while (true) {
//         if (type == 1 &&
//             year == solYear &&
//             month == solMonth &&
//             day == solDay) {
//             return new myDate(lunYear, lunMonth, lunDay, lunLeapMonth);
//         }
//         else if (type == 2 &&
//             year == lunYear &&
//             month == lunMonth &&
//             day == lunDay &&
//             leapmonth == lunLeapMonth) {
//             return new myDate(solYear, solMonth, solDay, 0);
//         }

//         // 양력의 마지막 날일 경우 년도를 증가시키고 나머지 초기화
//         if (solMonth == 12 && solDay == 31) {
//             solYear++;
//             solMonth = 1;
//             solDay = 1;

//             // 윤년일 시 2월달의 총 일수를 1일 증가
//             if (solYear % 400 == 0)
//                 solMonthDay[1] = 29;
//             else if (solYear % 100 == 0)
//                 solMonthDay[1] = 28;
//             else if (solYear % 4 == 0)
//                 solMonthDay[1] = 29;
//             else
//                 solMonthDay[1] = 28;

//         }
//         // 현재 날짜가 달의 마지막 날짜를 가리키고 있을 시 달을 증가시키고 날짜 1로 초기화
//         else if (solMonthDay[solMonth - 1] == solDay) {
//             solMonth++;
//             solDay = 1;
//         }
//         else
//             solDay++;

//         // 음력의 마지막 날인 경우 년도를 증가시키고 달과 일수를 초기화
//         if (lunMonth == 12 &&
//             ((lunarMonthTable[lunIndex][lunMonth - 1] == 1 && lunDay == 29) ||
//                 (lunarMonthTable[lunIndex][lunMonth - 1] == 2 && lunDay == 30))) {
//             lunYear++;
//             lunMonth = 1;
//             lunDay = 1;

//             if (lunYear > 2043) {
//                 alert("입력하신 달은 없습니다.");
//                 break;
//             }

//             // 년도가 바꼈으니 index값 수정
//             lunIndex = lunYear - LAST_LUNAR_YEAR;

//             // 음력의 1월에는 1 or 2만 있으므로 1과 2만 비교하면됨
//             if (lunarMonthTable[lunIndex][lunMonth - 1] == 1)
//                 lunMonthDay = 29;
//             else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2)
//                 lunMonthDay = 30;
//         }
//         // 현재날짜가 이번달의 마지막날짜와 일치할 경우
//         else if (lunDay == lunMonthDay) {

//             // 윤달인데 윤달계산을 안했을 경우 달의 숫자는 증가시키면 안됨
//             if (lunarMonthTable[lunIndex][lunMonth - 1] >= 3
//                 && lunLeapMonth == 0) {
//                 lunDay = 1;
//                 lunLeapMonth = 1;
//             }
//             // 음달이거나 윤달을 계산 했을 겨우 달을 증가시키고 lunLeapMonth값 초기화
//             else {
//                 lunMonth++;
//                 lunDay = 1;
//                 lunLeapMonth = 0;
//             }

//             // 음력의 달에 맞는 마지막날짜 초기화
//             if (lunarMonthTable[lunIndex][lunMonth - 1] == 1)
//                 lunMonthDay = 29;
//             else if (lunarMonthTable[lunIndex][lunMonth - 1] == 2)
//                 lunMonthDay = 30;
//             else if (lunarMonthTable[lunIndex][lunMonth - 1] == 3)
//                 lunMonthDay = 29;
//             else if (lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
//                 lunLeapMonth == 0)
//                 lunMonthDay = 29;
//             else if (lunarMonthTable[lunIndex][lunMonth - 1] == 4 &&
//                 lunLeapMonth == 1)
//                 lunMonthDay = 30;
//             else if (lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
//                 lunLeapMonth == 0)
//                 lunMonthDay = 30;
//             else if (lunarMonthTable[lunIndex][lunMonth - 1] == 5 &&
//                 lunLeapMonth == 1)
//                 lunMonthDay = 29;
//             else if (lunarMonthTable[lunIndex][lunMonth - 1] == 6)
//                 lunMonthDay = 30;
//         }
//         else
//             lunDay++;
//     }
// }

// // 양력을 음력날짜로 변환
// function solarToLunar(solYear, solMonth, solDay) {
//     // 날짜 형식이 안맞을 경우 공백 반환
//     if (!solYear || solYear == 0 ||
//         !solMonth || solMonth == 0 ||
//         !solDay || solDay == 0) {
//         return "";
//     }

//     /* 양력/음력 변환 */
//     var date = lunarCalc(solYear, solMonth, solDay, SOLAR_TO_LUNAR);

//     // 음력 배열의 범위를 초과하면 공백 반환
//     if(date == undefined || date == "" || date == null)
//         return "";
//     else
//         return "<span class='lunarDate'> " + (date.leapMonth ? "(윤)" : "") + date.month + "." + date.day + "</span>";
// }