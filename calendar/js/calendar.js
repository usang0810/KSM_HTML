$(function () {
    sm_calendar.calendarInit();
});

let sm_calendar = {
    defaultApiUrl: "http://127.0.0.1:8080",
    todayTime: undefined,
    childPopup: undefined,
    krTime: 1000 * 60 * 60 * 9,
    listIdx: undefined,
    tinyOption: {
        selector: '#sm_setCalendar_tiny',
        width: "100%",
        height: "100%",
        resize: false, // false 입력 시 사이즈 조절 불가능
        placeholder: '내용을 입력해주세요',
        plugins: [
            'advlist autolink link lists charmap paste',
            'anchor pagebreak spellchecker searchreplace wordcount'
        ],
        style_formats: [
            { title: 'Headings', items: [
                { title: 'Heading 1', format: 'h1' },
                { title: 'Heading 2', format: 'h2' },
                { title: 'Heading 3', format: 'h3' },
            ]},
            { title: 'Bold', format: 'bold' },
            { title: 'Italic', format: 'italic' },
            { title: 'Underline', format: 'underline' },
            { title: 'Strikethrough', format: 'strikethrough' },
            { title: 'Superscript', format: 'superscript' },
            { title: 'Subscript', format: 'subscript' },
            { title: 'Code', format: 'code' }
        ],
        menubar: false,
        toolbar: 'undo redo | styleselect forecolor backcolor | ' + 
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent'
    },
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
                console.log(err)
                calendarObj.todayTime = 0;
            }
        });
    },
    setElement: function(elementName, attrObj, htmlVal){
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
    },
    getUTCTime: function(inputDate){
        var dateArr = inputDate.split("-");
        var dateObj = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
        return dateObj.getTime() - this.krTime;
    },
    dateFormatter: function(inputYear, inputMonth, inputDay){
        var strMonth = ("0" + inputMonth).slice(-2);
        var strDay = ("0" + inputDay).slice(-2);
        return inputYear + "-" + strMonth + "-" + strDay;
    },
    calendarInit: function () {
        var calendarObj = this;
        calendarObj.getServerTime();
        var date = new Date(calendarObj.todayTime);

        var nowYear = date.getFullYear();
        var nowMonth = date.getMonth() + 1;
        var nowDay = date.getDate();
        // const SOLAR_HOLIDAY = [
        //     {month: 1, day: 1, caption: "새해"},
        //     {month: 3, day: 1, caption: "삼일절"},
        //     {month: 5, day: 5, caption: "어린이날"},
        //     {month: 6, day: 6, caption: "현충일"},
        //     {month: 8, day: 15, caption: "광복절"},
        //     {month: 10, day: 3, caption: "개천절"},
        //     {month: 10, day: 9, caption: "한글날"},
        //     {month: 12, day: 25, caption: "크리스마스"},
        // ];
        // const LUNAR_HOLIDAY = [
        //     {month: 1, day: 1, caption: "설날"},
        //     {month: 4, day: 8, caption: "석가탄신일"},
        //     {month: 8, day: 15, caption: "추석"},
        // ];

        // 클릭시 visible div 보이게 하는 영역
        var calDiv = document.getElementById("sm_calendar");
        var div = calendarObj.setElement("div", {"id": "sm_calendar_absoluteDiv"});
        var childDiv = calendarObj.setElement("div", {"id": "sm_calendar_listTitleWrapper"});
        var span = calendarObj.setElement("span", {"id": "sm_calendar_listTitle"});
        childDiv.appendChild(span);
        div.appendChild(childDiv);
        childDiv = calendarObj.setElement("div", {"id": "sm_calendar_listLocationWrapper"});
        var span = calendarObj.setElement("span", {"id": "sm_calendar_listLocation"});
        childDiv.appendChild(span);
        div.appendChild(childDiv);
        childDiv = calendarObj.setElement("div", {"id": "sm_calendar_listBtnWrapper"});
        var btn = calendarObj.setElement("button", {"id": "sm_calendar_getListBtn"}, "보기");
        childDiv.appendChild(btn);
        btn = calendarObj.setElement("button", {"id": "sm_calendar_deleteListBtn"}, "삭제");
        childDiv.appendChild(btn);
        btn = calendarObj.setElement("button", {"id": "sm_calendar_closeListBtn"}, "닫기");
        childDiv.appendChild(btn);
        div.appendChild(childDiv);
        calDiv.appendChild(div);

        var backDiv = calendarObj.setElement("div", {"id": "sm_calendar_setCalendarBack"});
        var setDiv = calendarObj.setElement("div", {"id": "sm_setCalendar"});
        calDiv.appendChild(backDiv);
        calDiv.appendChild(setDiv);
        // calendarObj.insertCalendarForm();

        var table = document.getElementById("sm_calendar_table");
        if (table !== null) {
            calDiv.removeChild(table);
        }
        var table = calendarObj.setElement("table", { "id": "sm_calendar_table" });
        calDiv.appendChild(table);

        calendarObj.changeCalendar(nowYear, nowMonth);

        function UTCToKr(utcTime){
            if(utcTime === undefined || utcTime === null || utcTime == "" ||
                (utcTime.length != 10 && utcTime.length != 13)){
                return "";
            }

            var numTime = Number(utcTime);
            if(utcTime.length == 10){
                numTime = numTime * 1000;
            }
            numTime = numTime + calendarObj.krTime;

            var date = new Date(numTime);
            console.log(date);

            return calendarObj.dateFormatter(date.getFullYear(), date.getMonth() + 1, date.getDate());
        }

        $("#sm_calendar_closeListBtn").on("click", function(){
            $("#sm_calendar_absoluteDiv").css("visibility", "hidden");
        });
        $("#sm_calendar_getListBtn").on("click", function(){
            calendarObj.getCalendarForm();
            $.ajax({
                url: "http://127.0.0.1:8080/getCalendarInfo",
                method: "get",
                dataType: "json",
                data: {
                    idx: calendarObj.listIdx
                },
                success: function (result) {
                    if (result.code == 1) {
                        var info = result.info;
                        console.log(info);

                        $("#sm_setCalendar_detailTitle").text(info.title);
                        $("#sm_setCalendar_detailLocation").text(info.location);
                        $("#sm_setCalendar_updateDate").text(UTCToKr(info.modifyDate));
                        $("#sm_setCalendar_writeDate").text(UTCToKr(info.writeDate));
                        $("#sm_setCalendar_startDate").text(UTCToKr(info.startDate));
                        $("#sm_setCalendar_endDate").text(UTCToKr(info.endDate));
                        $("#sm_setCalendar_content").html(info.content);
                    }
                },
                error: function (err) {
                    console.log(err);
                    returnValue = null;
                }
            });
            $("#sm_calendar_setCalendarBack").show();
            $("#sm_setCalendar").show();
        });
        $("#sm_calendar_deleteListBtn").on("click", function(){
            if(confirm("일정을 삭제하시겠습니까?")){
                $.ajax({
                    url: "http://127.0.0.1:8080/deleteCalendar",
                    method: "post",
                    dataType: "json",
                    data: {
                        idx: calendarObj.listIdx
                    },
                    success: function (result) {
                        if (result.code == 1) {
                            var nowYear = $("#sm_calendar_inputYear option:selected").val();
                            var nowMonth = $("#sm_calendar_inputMonth option:selected").val();
                            $("#sm_calendar_absoluteDiv").css("visibility", "hidden");
                            
                            calendarObj.changeCalendar(nowYear, nowMonth);
                            alert("일정이 삭제되었습니다.");
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    },
                });
            }
        });
    },
    insertCalendarForm: function(nowYear, nowMonth, nowDay){
        var calendarObj = this;

        var setDiv = document.getElementById("sm_setCalendar");
        $(setDiv).empty();
        var div = calendarObj.setElement("div", {"id": "sm_setCalendar_btnWrapper"});
        var btn = calendarObj.setElement("button", {"class": "sm_setCalendar_btn", "id": "sm_setCalendar_saveBtn"}, "저장후닫기");
        div.appendChild(btn);
        btn = calendarObj.setElement("button", {"class": "sm_setCalendar_btn", "id": "sm_setCalendar_closeBtn"}, "닫기");
        div.appendChild(btn);
        setDiv.appendChild(div);
        div = calendarObj.setElement("div", {"id": "sm_setCalendar_inputWrapper"});
        childDiv = document.createElement("div");
        var table = document.createElement("table");

        var tr = document.createElement("tr");
        var th = calendarObj.setElement("th", {}, "위치");
        var td = document.createElement("td");
        var input = calendarObj.setElement("input", {"type": "text", "id": "sm_setCalendar_inputLocation"});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);

        tr = document.createElement("tr");
        th = calendarObj.setElement("th", {}, "제목");
        td = document.createElement("td");
        input = calendarObj.setElement("input", {"type": "text", "id": "sm_setCalendar_inputTitle"});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);

        var convertDate = calendarObj.dateFormatter(nowYear, nowMonth, nowDay);
        tr = document.createElement("tr");
        th = calendarObj.setElement("th", {}, "일정");
        td = document.createElement("td");
        input = calendarObj.setElement("input", {"type": "date", "id": "sm_setCalendar_startDate", "value": convertDate});
        td.appendChild(input);
        var span = calendarObj.setElement("span", {}, " ~ ");
        td.appendChild(span);
        input = calendarObj.setElement("input", {"type": "date", "id": "sm_setCalendar_endDate", "value": convertDate});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
        childDiv.appendChild(table);
        div.appendChild(childDiv);
        setDiv.appendChild(div);

        div = calendarObj.setElement("div", {"id": "sm_setCalendar_textWrapper"});
        var textarea = calendarObj.setElement("textarea", {"id": "sm_setCalendar_tiny"});
        div.appendChild(textarea);
        setDiv.appendChild(div);

        tinymce.init(calendarObj.tinyOption);

        $("#sm_setCalendar_saveBtn").on("click", function(){
            var location = $("#sm_setCalendar_inputLocation").val();
            var title = $("#sm_setCalendar_inputTitle").val();
            var startDate = $("#sm_setCalendar_startDate").val();
            var endDate = $("#sm_setCalendar_endDate").val();
            var content = tinymce.get("sm_setCalendar_tiny").getContent();

            if(title == null || title ==""){
                alert("제목을 입력해주세요");
                $("#sm_setCalendar_inputTitle").focus();
                return;
            }

            if(startDate == null || startDate == ""){
                alert("일정 시작일을 지정해주세요");
                $("#sm_setCalendar_startDate").focus();
                return;
            }else{
                startDate = calendarObj.getUTCTime(startDate);
            }

            if(endDate == null || endDate == ""){
                alert("일정 마감일을 지정해주세요");
                $("#sm_setCalendar_endDate").focus();
                return;
            }else{
                endDate = calendarObj.getUTCTime(endDate);
            }

            if(startDate > endDate){
                alert("일정 시작일이 마감일보다 늦은 날짜일 수 없습니다");
                $("#sm_setCalendar_startDate").focus();
                return;
            }

            if(content.length > 255){
                alert("본문 내용은 255byte를 초과할 수 없습니다.");
                return;
            }

            $.ajax({
                url: "http://127.0.0.1:8080/setCalendar",
                method: "post",
                dataType: "json",
                data: {
                    location: location,
                    title: title,
                    startDate: startDate,
                    endDate: endDate,
                    content, content
                },
                success: function (result) {
                    if (result.code == 1) {
                        $("#sm_setCalendar_inputLocation").val("");
                        $("#sm_setCalendar_inputTitle").val("");
                        tinymce.get("sm_setCalendar_tiny").setContent("");
                        
                        $("#sm_calendar_setCalendarBack").hide();
                        $("#sm_setCalendar").hide();
                        calendarObj.changeCalendar(nowYear, nowMonth);
                        alert("일정이 추가되었습니다");
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });
            
        });
        $("#sm_setCalendar_closeBtn").on("click", function(){
            $("#sm_calendar_setCalendarBack").hide();
            $("#sm_setCalendar").hide();
        });
    },
    getCalendarForm: function(){
        var calendarObj = this;

        var setDiv = document.getElementById("sm_setCalendar");
        $(setDiv).empty();
        var div = calendarObj.setElement("div", {"id": "sm_setCalendar_btnWrapper"});
        var btn = calendarObj.setElement("button", {"class": "sm_setCalendar_btn", "id": "sm_setCalendar_updateBtn"}, "수정");
        div.appendChild(btn);
        var btn = calendarObj.setElement("button", {"class": "sm_setCalendar_btn", "id": "sm_setCalendar_deleteBtn"}, "삭제");
        div.appendChild(btn);
        btn = calendarObj.setElement("button", {"class": "sm_setCalendar_btn", "id": "sm_setCalendar_closeBtn"}, "닫기");
        div.appendChild(btn);
        setDiv.appendChild(div);
        div = calendarObj.setElement("div", {"id": "sm_setCalendar_detailWrapper"});
        childDiv = document.createElement("div");
        var table = document.createElement("table");

        // 열 너비조정
        var colgroup = document.createElement("colgroup");
        var col = document.createElement("col");
        col.style.width = "80px";
        colgroup.appendChild(col);
        
        col = document.createElement("col");
        col.style.width = "calc((100% - 160px) / 2)";
        colgroup.appendChild(col);

        col = document.createElement("col");
        col.style.width = "80px";
        colgroup.appendChild(col);

        col = document.createElement("col");
        col.style.width = "calc((100% - 160px) / 2)";
        colgroup.appendChild(col);
        table.appendChild(colgroup);

        var tr = document.createElement("tr");
        var th = calendarObj.setElement("th", {}, "제목");
        var td = calendarObj.setElement("td", {"colspan": "3"});
        var span = calendarObj.setElement("span", {"id": "sm_setCalendar_detailTitle"});
        td.appendChild(span);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);

        tr = document.createElement("tr");
        th = calendarObj.setElement("th", {}, "위치");
        td = calendarObj.setElement("td", {"colspan": "3"});
        span = calendarObj.setElement("span", {"id": "sm_setCalendar_detailLocation"});
        td.appendChild(span);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);

        tr = document.createElement("tr");
        th = calendarObj.setElement("th", {}, "수정일");
        td = calendarObj.setElement("td");
        span = calendarObj.setElement("span", {"id": "sm_setCalendar_updateDate"});
        td.appendChild(span);
        tr.appendChild(th);
        tr.appendChild(td);
        th = calendarObj.setElement("th", {}, "작성일");
        td = calendarObj.setElement("td");
        span = calendarObj.setElement("span", {"id": "sm_setCalendar_writeDate"});
        td.appendChild(span);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
        
        tr = document.createElement("tr");
        th = calendarObj.setElement("th", {}, "기간");
        td = calendarObj.setElement("td", {"colspan": "3"});
        span = calendarObj.setElement("span", {"id": "sm_setCalendar_startDate"});
        td.appendChild(span);
        span = calendarObj.setElement("span", {}, " ~ ");
        td.appendChild(span);
        span = calendarObj.setElement("span", {"id": "sm_setCalendar_endDate"});
        td.appendChild(span);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
        childDiv.appendChild(table);
        div.appendChild(childDiv);
        setDiv.appendChild(div);

        div = calendarObj.setElement("div", {"id": "sm_setCalendar_contentWrapper"});
        childDiv = calendarObj.setElement("div", {"id": "sm_setCalendar_content"}, "test");
        div.appendChild(childDiv);

        setDiv.appendChild(div);

        $("#sm_setCalendar_closeBtn").on("click", function(){
            $("#sm_calendar_setCalendarBack").hide();
            $("#sm_setCalendar").hide();
        });
        $("#sm_setCalendar_updateBtn").on("click", function(){
            var title = $("#sm_setCalendar_detailTitle").text();
            var location = $("#sm_setCalendar_detailLocation").text();
            var startDate = $("#sm_setCalendar_startDate").text();
            var endDate = $("#sm_setCalendar_endDate").text();
            var content = $("#sm_setCalendar_content").html();
            var obj = {
                title: title,
                location: location,
                startDate: startDate,
                endDate: endDate,
                content: content
            }

            calendarObj.updateCalendarForm(obj);
        });
        $("#sm_setCalendar_deleteBtn").on("click", function(){
            if(confirm("일정을 삭제하시겠습니까?")){
                $.ajax({
                    url: "http://127.0.0.1:8080/deleteCalendar",
                    method: "post",
                    dataType: "json",
                    data: {
                        idx: calendarObj.listIdx
                    },
                    success: function (result) {
                        if (result.code == 1) {
                            alert("일정이 삭제되었습니다.");
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    },
                });
                var nowYear = $("#sm_calendar_inputYear option:selected").val();
                var nowMonth = $("#sm_calendar_inputMonth option:selected").val();
                $("#sm_calendar_setCalendarBack").hide();
                $("#sm_setCalendar").hide();
                $("#sm_calendar_absoluteDiv").css("visibility", "hidden");
                
                calendarObj.changeCalendar(nowYear, nowMonth);
            }
        });
    },
    updateCalendarForm: function(obj){
        var calendarObj = this;

        var setDiv = document.getElementById("sm_setCalendar");
        $(setDiv).empty();
        var div = calendarObj.setElement("div", {"id": "sm_setCalendar_btnWrapper"});
        var btn = calendarObj.setElement("button", {"class": "sm_setCalendar_btn", "id": "sm_setCalendar_updateBtn"}, "수정후닫기");
        div.appendChild(btn);
        var btn = calendarObj.setElement("button", {"class": "sm_setCalendar_btn", "id": "sm_setCalendar_deleteBtn"}, "삭제");
        div.appendChild(btn);
        btn = calendarObj.setElement("button", {"class": "sm_setCalendar_btn", "id": "sm_setCalendar_closeBtn"}, "닫기");
        div.appendChild(btn);
        setDiv.appendChild(div);
        div = calendarObj.setElement("div", {"id": "sm_setCalendar_inputWrapper"});
        childDiv = document.createElement("div");
        var table = document.createElement("table");

        var tr = document.createElement("tr");
        var th = calendarObj.setElement("th", {}, "위치");
        var td = document.createElement("td");
        var input = calendarObj.setElement("input", {"type": "text", "id": "sm_setCalendar_inputLocation", "value": obj.location});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);

        tr = document.createElement("tr");
        th = calendarObj.setElement("th", {}, "제목");
        td = document.createElement("td");
        input = calendarObj.setElement("input", {"type": "text", "id": "sm_setCalendar_inputTitle", "value": obj.title});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);

        tr = document.createElement("tr");
        th = calendarObj.setElement("th", {}, "일정");
        td = document.createElement("td");
        input = calendarObj.setElement("input", {"type": "date", "id": "sm_setCalendar_startDate", "value": obj.startDate});
        td.appendChild(input);
        input = calendarObj.setElement("span", {}, " ~ ");
        td.appendChild(input);
        input = calendarObj.setElement("input", {"type": "date", "id": "sm_setCalendar_endDate", "value": obj.endDate});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
        childDiv.appendChild(table);
        div.appendChild(childDiv);
        setDiv.appendChild(div);

        console.log(obj.content);
        div = calendarObj.setElement("div", {"id": "sm_setCalendar_textWrapper"});
        var textarea = calendarObj.setElement("textarea", {"id": "sm_setCalendar_tiny"}, obj.content);
        div.appendChild(textarea);
        setDiv.appendChild(div);

        tinymce.init(calendarObj.tinyOption);

        $("#sm_setCalendar_closeBtn").on("click", function(){
            $("#sm_calendar_setCalendarBack").hide();
            $("#sm_setCalendar").hide();
        });
        $("#sm_setCalendar_deleteBtn").on("click", function(){
            if(confirm("일정을 삭제하시겠습니까?")){
                $.ajax({
                    url: "http://127.0.0.1:8080/deleteCalendar",
                    method: "post",
                    dataType: "json",
                    data: {
                        idx: calendarObj.listIdx
                    },
                    success: function (result) {
                        if (result.code == 1) {
                            alert("일정이 삭제되었습니다.");
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    },
                });
                var nowYear = $("#sm_calendar_inputYear option:selected").val();
                var nowMonth = $("#sm_calendar_inputMonth option:selected").val();
                $("#sm_calendar_setCalendarBack").hide();
                $("#sm_setCalendar").hide();
                $("#sm_calendar_absoluteDiv").css("visibility", "hidden");
                
                calendarObj.changeCalendar(nowYear, nowMonth);
            }
        });
        $("#sm_setCalendar_updateBtn").on("click", function(){
            var location = $("#sm_setCalendar_inputLocation").val();
            var title = $("#sm_setCalendar_inputTitle").val();
            var startDate = $("#sm_setCalendar_startDate").val();
            var endDate = $("#sm_setCalendar_endDate").val();
            var content = tinymce.get("sm_setCalendar_tiny").getContent();
            if(content === undefined || content === null || content == ""){
                content = $("#sm_setCalendar_tiny").val();
            }

            if(title == null || title ==""){
                alert("제목을 입력해주세요");
                $("#sm_setCalendar_inputTitle").focus();
                return;
            }

            if(startDate == null || startDate == ""){
                alert("일정 시작일을 지정해주세요");
                $("#sm_setCalendar_startDate").focus();
                return;
            }else{
                startDate = calendarObj.getUTCTime(startDate);
            }

            if(endDate == null || endDate == ""){
                alert("일정 마감일을 지정해주세요");
                $("#sm_setCalendar_endDate").focus();
                return;
            }else{
                endDate = calendarObj.getUTCTime(endDate);
            }

            if(startDate > endDate){
                alert("일정 시작일이 마감일보다 늦은 날짜일 수 없습니다");
                $("#sm_setCalendar_startDate").focus();
                return;
            }

            if(content.length > 255){
                alert("본문 내용은 255byte를 초과할 수 없습니다.");
                return;
            }

            if(confirm("일정을 수정하시겠습니까?")){
                $.ajax({
                    url: "http://127.0.0.1:8080/updateCalendar",
                    method: "post",
                    dataType: "json",
                    data: {
                        idx: calendarObj.listIdx,
                        location: location,
                        title: title,
                        startDate: startDate,
                        endDate: endDate,
                        content, content
                    },
                    success: function (result) {
                        if (result.code == 1) {
                            $("#sm_setCalendar_inputLocation").val("");
                            $("#sm_setCalendar_inputTitle").val("");
                            tinymce.get("sm_setCalendar_tiny").setContent("");

                            var nowYear = $("#sm_calendar_inputYear option:selected").val();
                            var nowMonth = $("#sm_calendar_inputMonth option:selected").val();
    
                            $("#sm_calendar_setCalendarBack").hide();
                            $("#sm_setCalendar").hide();
                            calendarObj.changeCalendar(nowYear, nowMonth);
                            alert("일정이 수정되었습니다");
                        }
                    },
                    error: function (err) {
                        console.log(err);
                    }
                });
            }
        });
    },
    changeCalendar: function(nowYear, nowMonth){
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

        const DAY_OF_WEEK = ['', '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        var calendarObj = this;
        var today = new Date(calendarObj.todayTime);
        var todayYear = today.getFullYear();
        var todayMonth = today.getMonth() + 1;
        var todayDay = today.getDate();

        var table = document.getElementById("sm_calendar_table");
        $(table).empty();

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
        var td = calendarObj.setElement("td", { "colspan": "8", "id": "sm_calendar_manage_row" });
        btn = calendarObj.setElement("button", { "id": "sm_calendar_todayBtn" }, "Today");
        td.appendChild(btn);

        btn = calendarObj.setElement("button", { "class": "sm_calendar_calBtn" }, "<<");
        td.appendChild(btn);
        btn = calendarObj.setElement("button", { "class": "sm_calendar_calBtn" }, "<");
        td.appendChild(btn);

        var select = calendarObj.setElement("select", { "id": "sm_calendar_inputYear" });
        for (var i = nowYear + 5; i >= nowYear - 5; i--) {
            var option;
            if (i == nowYear) option = calendarObj.setElement("option", { "value": i, "selected": true }, i);
            else option = calendarObj.setElement("option", { "value": i }, i);
            select.appendChild(option);
        }
        td.appendChild(select);
        var span = calendarObj.setElement("span", {}, "년");
        td.appendChild(span);

        select = calendarObj.setElement("select", { "id": "sm_calendar_inputMonth" });
        for (var i = 1; i <= 12; i++) {
            var option;
            if (i == nowMonth) option = calendarObj.setElement("option", { "value": i, "selected": true }, i);
            else option = calendarObj.setElement("option", { "value": i }, i);
            select.appendChild(option);
        }
        td.appendChild(select);
        span = calendarObj.setElement("span", {}, "월");
        td.appendChild(span);

        btn = calendarObj.setElement("button", { "class": "sm_calendar_calBtn" }, ">");
        td.appendChild(btn);
        btn = calendarObj.setElement("button", { "class": "sm_calendar_calBtn" }, ">>");
        td.appendChild(btn);
        tr.appendChild(td);
        table.appendChild(tr);

        // 요일 행 생성
        tr = calendarObj.setElement("tr", { "class": "sm_calendar_dayOfWeek" });
        for (var i = 0; i < DAY_OF_WEEK.length; i++) {
            td = calendarObj.setElement("td", {}, DAY_OF_WEEK[i]);
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
        var div;
        var divWrapper;
        var tr = calendarObj.setElement("tr", { "class": "sm_calendar_date_row" });
        var td = calendarObj.setElement("td", { "class": "sm_calendar_weekCount" }, (weekCount++ + '주'));
        tr.appendChild(td);

        var dateIdx = 0;
        // 시작 요일이 일요일이 아니면 저번달의 마지막주 표시
        if (firstDOW != 0) {
            var beforeMonth = new Date(nowYear, nowMonth - 1, 0);
            var lastWeekDay = beforeMonth.getDate();
            var lastWeekhDOW = beforeMonth.getDay();
            
            for (var i = lastWeekhDOW; i >= 0; i--) {
                td = calendarObj.setElement("td", { "class": "sm_calendar_lastNextCaption" });
                divWrapper = calendarObj.setElement("div", {"class": "sm_calendar_divWrapper"});
                div = calendarObj.setElement("div", {}, lastWeekDay - i);
                divWrapper.appendChild(div);
                td.appendChild(divWrapper);
                tr.appendChild(td);
                dateIdx++;
            }
        }
        // 달력 표시
        for (var i = 1; i <= nowLastDay; i++) {
            var lunDate = calendarObj.solarToLunar(nowYear, nowMonth, i);

            if (todayYear == nowYear && todayMonth == nowMonth && todayDay == i)
                td = calendarObj.setElement("td", { "class": "sm_calendar_date sm_calendar_today" });
            else
                td = calendarObj.setElement("td", { "class": "sm_calendar_date" });

            divWrapper = calendarObj.setElement("div", {"class": "sm_calendar_divWrapper"});
            div = calendarObj.setElement("div", { "class": "sm_calendar_dateTitle" });
            span = calendarObj.setElement("span", {}, i);
            div.appendChild(span);
            span = calendarObj.setElement("span", {}, lunDate);
            div.appendChild(span);
            divWrapper.appendChild(div);

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

                    div = calendarObj.setElement("div", {"class": "sm_calendar_dateList"});
                    var input = calendarObj.setElement("input", {"type": "hidden", "value": calendarList[j].idx, "class": "sm_calendar_listIdx"});
                    div.appendChild(input);
                    span = calendarObj.setElement("span", {"class": "sm_calendar_listTitle"}, calendarList[j].title);
                    div.appendChild(span);
                    if(calendarList[j].location != ""){
                        span = calendarObj.setElement("span", {"class": "sm_calendar_listLocation"}, " (" + calendarList[j].location + ")");
                        div.appendChild(span);
                    }
                    divWrapper.appendChild(div);
                }
            }
            td.appendChild(divWrapper);
            tr.appendChild(td);

            dateIdx++;
            if (dateIdx >= 7) {
                dateIdx = 0;
                if (i == nowLastDay) break;
                else {
                    table.appendChild(tr);
                    tr = calendarObj.setElement("tr", { "class": "sm_calendar_date_row" });
                    td = calendarObj.setElement("td", { "class": "sm_calendar_weekCount" }, weekCount++ + "주");
                    tr.appendChild(td);
                }
            }
            table.appendChild(tr);
        }

        // 이번달 마지막 요일이 토요일이 아니면 다음달의 첫번째 주 표시
        if (dateIdx != 0) {
            var nextMonth = new Date(nowYear, nowMonth, 1);
            var nextWeekDOW = nextMonth.getDay();
            var nextWeekFirstDay = 1;
            for (var i = nextWeekDOW; i <= 6; i++) {
                td = calendarObj.setElement("td", { "class": "sm_calendar_lastNextCaption" });
                div = calendarObj.setElement("div", {}, nextWeekFirstDay++);
                divWrapper = calendarObj.setElement("div", {"class": "sm_calendar_divWrapper"});
                divWrapper.appendChild(div);
                td.appendChild(divWrapper);
                tr.appendChild(td);
            }
        }
        table.appendChild(tr);

        // 달력 변환 함수
        function change(obj) {
            var year = $("#sm_calendar_inputYear").val();
            var month = $("#sm_calendar_inputMonth").val();

            if (obj !== undefined) {
                var btnVal = $(obj).text();

                if (btnVal == '<') {
                    if (month == 1) {
                        month = 12;
                        year--;
                    } else {
                        month--;
                    }

                } else if (btnVal == '>') {
                    if (month == 12 ) {
                        month = 1;
                        year++;
                    } else {
                        month++;
                    }

                } else if (btnVal == '<<') {
                    year--;

                } else if (btnVal == '>>') {
                    year++;
                }
            }
            $("#sm_calendar_absoluteDiv").css("visibility", "hidden");
            calendarObj.changeCalendar(Number(year), Number(month));
        }

        $(".sm_calendar_calBtn").on("click", function () {
            change(this);
        });
        $("#sm_calendar_inputYear").on("change", function () {
            change();
        });
        $("#sm_calendar_inputMonth").on("change", function () {
            change();
        });
        $("#sm_calendar_todayBtn").on("click", function(){
            var date = new Date(calendarObj.todayTime);
            calendarObj.changeCalendar(date.getFullYear(), date.getMonth() + 1);
        });
        $(".sm_calendar_dateTitle").on("click", function () {
            var obj = this;
            var inputDay = $(obj).children("span:first-child").text();
            calendarObj.insertCalendarForm(nowYear, nowMonth, inputDay);
            $("#sm_calendar_setCalendarBack").show();
            $("#sm_setCalendar").show();
        });
        $(".sm_calendar_dateList").on("click", function(event){
            var obj = this;
            var title = $(obj).children(".sm_calendar_listTitle").text();
            var location = $(obj).children(".sm_calendar_listLocation").text();
            calendarObj.listIdx = $(obj).children(".sm_calendar_listIdx").val();
            var left = $("#sm_calendar").offset().left;
            var top = $("#sm_calendar").offset().top;
            var calWidth = Number($("#sm_calendar").css("width").replace("px", ""));
            var calHeight = Number($("#sm_calendar").css("height").replace("px", ""));
            var abWidth = Number($("#sm_calendar_absoluteDiv").css("width").replace("px", ""));
            var abHeight = Number($("#sm_calendar_absoluteDiv").css("height").replace("px", ""));
            $("#sm_calendar_listTitle").text(title);
            $("#sm_calendar_listLocation").text(location);

            if(calWidth < event.clientX - left + abWidth){
                $("#sm_calendar_absoluteDiv").css("left", event.clientX - left - abWidth);
            }else{
                $("#sm_calendar_absoluteDiv").css("left", event.clientX - left);
            }

            if(calHeight < event.clientY - top + abHeight){
                $("#sm_calendar_absoluteDiv").css("top", event.clientY - top - abHeight);
            }else{
                $("#sm_calendar_absoluteDiv").css("top", event.clientY - top);
            }

            $("#sm_calendar_absoluteDiv").css("visibility", "visible");
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