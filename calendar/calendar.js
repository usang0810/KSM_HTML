/*
    달력의 행 앞에 '주차'가 표시되게 수정
    공휴일 인식시 빨간날로 처리하게 수정
*/

// 전역변수 선언 부분
let g_today = new Date();
const DAY_OF_WEEK = ['', '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

// 테스트 json
let g_testObj = {
    msg: "success",
    dataArr: [
        {date:"20200515", caption:"만기", amount:"19", headCount:"37", balance:"324"},
        {date:"20200515", caption:"만기", amount:"11", headCount:"23", balance:"8"},
        {date:"20200515", caption:"만기", amount:"13", headCount:"4", balance:"31"},
        {date:"20200515", caption:"만기", amount:"7", headCount:"11", balance:"53"},
        {date:"20200520", caption:"만기", amount:"32", headCount:"53", balance:"6"},
        {date:"20200520", caption:"만기", amount:"32", headCount:"53", balance:"1001"},
        {date:"20200530", caption:"만기", amount:"1", headCount:"63", balance:"10"},
        {date:"20201001", caption:"만기", amount:"5", headCount:"21", balance:"12"},
        {date:"20201231", caption:"만기", amount:"87", headCount:"9", balance:"152"}
    ]
};

// 공휴일 테스트용 json
let g_holidays = {
    msg:"success",
    dataArr:[
        {date:"20200101", caption:"새해"},
        {date:"20200124", caption:"설날"},
        {date:"20200125", caption:"설날"},
        {date:"20200126", caption:"설날"},
        {date:"20200301", caption:"삼일절"},
        {date:"20200430", caption:"부처님 오신 날"},
        {date:"20200505", caption:"어린이날"},
        {date:"20200606", caption:"현충일"},
        {date:"20200815", caption:"광복절"},
        {date:"20200930", caption:"추석"},
        {date:"20201001", caption:"추석"},
        {date:"20201002", caption:"추석"},
        {date:"20201003", caption:"개천절"},
        {date:"20201009", caption:"한글날"},
        {date:"20201225", caption:"크리스마스"},
    ]
};

// 로드 함수 시 오늘날짜로 달력 생성
$(function(){
    calendarInit(g_today);
})

// 달력 초기화 함수
// param = Date
function calendarInit(date){
    var nowYear = date.getFullYear();
    var nowMonth = date.getMonth() + 1;

    var html = 
    '<colgroup>' +
    '<col style="width: 50px;">' +
    '<col style="width: calc(14.2% - 50px);">' +
    '<col style="width: calc(14.2% - 50px);">' +
    '<col style="width: calc(14.2% - 50px);">' +
    '<col style="width: calc(14.2% - 50px);">' +
    '<col style="width: calc(14.2% - 50px);">' +
    '<col style="width: calc(14.2% - 50px);">' +
    '<col style="width: calc(14.2% - 50px);">' +
    '</colgroup>' +
    '<tr>' +
    '<td colspan="8" id="manage-row">' +
    '<button class="calBtn" onclick="changeCalendar(this);">&lt;&lt;</button>' +
    '<button class="calBtn" onclick="changeCalendar(this);">&lt;</button>' +
    '<select name="year" id="inputYear" onchange="changeCalendar();">';
    for(var i=nowYear + 3; i>=nowYear - 3; i--){
        html += '<option value=' + i;
        if(i == nowYear) html += ' selected';
        html += '>' + i + '</option>';
    }
    html +=
    '</select>년&nbsp;&nbsp;' +
    '<select name="month" id="inputMonth" onchange="changeCalendar();">';
    for(var i=1; i<=12; i++){
        html += '<option value=' + i;
        if(i == nowMonth) html+= ' selected';
        html += '>' + i + '</option>';
    }
    html += 
    '</select>월' +
    '<button class="calBtn" onclick="changeCalendar(this);">&gt;</button>' +
    '<button class="calBtn" onclick="changeCalendar(this);">&gt;&gt;</button>' +
    '</td>' +
    '</tr>' +
    '<tr>';
    // '요일' 생성 반복문
    for(var i=0; i<DAY_OF_WEEK.length; i++){
        html += '<td>' + DAY_OF_WEEK[i] + '</td>';
    }
    html += '</tr>';

    // 달력의 날짜 생성 부분
    var firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    var firstDay = firstDate.getDay();

    var weekCount = 1; // '주차' 표시용 변수
    html += '<tr class="date-row">' + 
    '<td class="weekCount">' + weekCount++ + '주</td>';

    var dateIdx = 0;
    if(firstDay != 0){
        var dateArr = getLastWeek(date);
        for(var i=0; i<firstDay; i++){
            html += '<td class="lastNextCaption">' + dateArr[i] + '</td>';
            dateIdx++;
        }
    }

    // 외부 json에 대한 처리
    let objArr = [];
    for(var i=0; i<g_testObj.dataArr.length; i++){
        var dateObj = dateFormatter(g_testObj.dataArr[i].date);
        if(dateObj != null && nowYear == dateObj.year && nowMonth == dateObj.month){
            objArr.push(g_testObj.dataArr[i]);
        }
    }

    // 공휴일에 대한 처리
    let holidayArr = [];
    for(var i=0; i<g_holidays.dataArr.length; i++){
        var dateObj = dateFormatter(g_holidays.dataArr[i].date);
        if(dateObj != null && nowYear == dateObj.year && nowMonth == dateObj.month){
            holidayArr.push(g_holidays.dataArr[i]);
        }
    }

    for(var i=firstDate.getDate(); i<=lastDate.getDate(); i++){
        var addCaption = '';
        var count = 0;

        // 외부 데이터가 있을 시 처리
        objArr.forEach(function (item, idx){
            var dateObj = dateFormatter(item.date);
            if(dateObj.date == i){
                if(count >= 3){
                    addCaption += '<div class="moreInfo">. . .</div>';
                    return;
                }

                addCaption +=
                '<div>' +
                '<span>' + item.caption + '</span>&nbsp;' +
                '<span>' + item.amount +'개/ ' + item.headCount + '명/ ' + item.balance + '억원</span>' +
                '</div>';
                count++;
            }
        });

        var holidayClass = '';
        var holidayCaption = '';
        // 공휴일이 있을 시 처리
        holidayArr.forEach(function (item, idx){
            var dateObj = dateFormatter(item.date);
            if(dateObj.date == i){
                holidayClass = ' holiday';
                holidayCaption += ' ' + item.caption;
                return;
            }
        });

        // 오늘날짜 처리
        if(g_today.getFullYear() == nowYear
            && g_today.getMonth() + 1 == nowMonth
            && g_today.getDate() == i){

                html += '<td class="date' + holidayClass + '" onclick="detailDate(this);">' + i + holidayCaption + ' Today' + addCaption + '</td>';
        }else{
            html += '<td class="date' + holidayClass + '" onclick="detailDate(this);">' + i + holidayCaption + addCaption + '</td>';
        }

        dateIdx++;
        if(dateIdx >= 7){
            dateIdx = 0;
            if(i == lastDate.getDate()) break;
            html += '</tr><tr class="date-row">';
            html += '<td class="weekCount">' + weekCount++ + '주</td>';
        }
    }

    if(dateIdx != 0){
        var dateArr = getNextWeek(date);
        for(var i=dateIdx; i<7; i++){
            html += '<td class="lastNextCaption">' + dateArr[i] + '</td>';
            dateIdx++;7
        }
    }
    html += '</tr>';

    $("#calendar-table").html(html);
}

// 달력에서 지난달의 마지막주 일차를 나타내기위해 값을 얻어오는 함수
function getLastWeek(date){
    var beforeMonth = new Date(date.getFullYear(), date.getMonth(), 0);
    var lastDate = beforeMonth.getDate();
    var lastDay = beforeMonth.getDay();
    var dateArr = [];

    for(var i=lastDay; i>=0; i--){
        dateArr.push(lastDate - i);
    }

    return dateArr;
}

// 달력에서 다음달의 첫번째주 일차를 나타내기위해 값을 얻어오는 함수
function getNextWeek(date){
    var nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    var firstDate = 1;
    var firstDay = nextMonth.getDay();
    var dateArr = [0, 0, 0, 0, 0, 0, 0];

    for(var i=firstDay; i<=6; i++){
        dateArr[i] = firstDate++;
    }

    return dateArr;
}

// 버튼, 셀렉박스 클릭 또는 값 변경 시 이벤트핸들러
function changeCalendar(obj){
    var year = $("#inputYear").val();
    var month = $("#inputMonth").val() - 1;

    if(obj !== undefined){
        var btnVal = $(obj).text();

        if(btnVal == '<'){
            if(month == 0){
                month = 11;
                year -= 1;
            }else{
                month--;
            }

        }else if(btnVal == '>'){
            if(month == 12){
                month == 0;
                year += 1;
            }else{
                month++;
            }

        }else if(btnVal == '<<'){
            year--;

        }else if(btnVal == '>>'){
            year++;
        }
    }
    calendarInit(new Date(year, month));
}

// 8byte 문자열로 작성된 날짜값 number로 데이터 타입 변환 후 객체로 반환
function dateFormatter(strDate){
    if(strDate.length > 8){
        return null;
    }

    var year = Number(strDate.slice(0, 4));
    var month = Number(strDate.slice(4, 6));
    var date = Number(strDate.slice(6, 8));

    return {"year":year, "month":month, "date":date};
}

// 날짜 상세조회
function detailDate(obj){
    window.open("detail.html", "detail", "width=960px, height=720px");
}