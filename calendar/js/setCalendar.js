function receiveMessage(event){
    console.log(event);
    sm_setCalendar.opener = window.opener;
    console.log(sm_setCalendar.opener);
    var dataObj = event.data;

    if(dataObj.type == 1){

    }else if(dataObj.type == 2){
        sm_setCalendar.setCalendar(dataObj.rdata.year, dataObj.rdata.month, dataObj.rdata.day);
    }else if(dataObj.type == 3){

    }
}

window.addEventListener('message', receiveMessage, false);

let sm_setCalendar = {
    opener: undefined,
    tinyOption: {
        selector: '#sm_setCalendar_tiny',
        width: "100%",
        height: 400,
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
    setCalendar: function(year, month, day){
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

        function dateFormatter(inputYear, inputMonth, inputDay){
            var strMonth = ("0" + inputMonth).slice(-2);
            var strDay = ("0" + inputDay).slice(-2);
            return inputYear + "-" + strMonth + "-" + strDay;
        }

        function getUTCTime(inputDate){
            var dateArr = inputDate.split("-");
            var dateObj = new Date(dateArr[0], dateArr[1] - 1, dateArr[2]);
            return dateObj.getTime() - (1000 * 60 * 60 * 9);
        }

        var strDate = dateFormatter(year, month, day);

        var calendarObj = this;
        var wrapperDiv = document.getElementById("sm_setCalendar");
        var div = setElement("div", {"id": "sm_setCalendar_btnWrapper"});
        var btn = setElement("button", {"class": "sm_setCalendar_btn", "id": "save"}, "저장후닫기");
        div.appendChild(btn);
        btn = setElement("button", {"class": "sm_setCalendar_btn", "id": "close"}, "닫기");
        div.appendChild(btn);
        wrapperDiv.appendChild(div);
        div = setElement("div", {"id": "sm_setCalendar_inputWrapper"});
        var childDiv = document.createElement("div");
        var table = document.createElement("table");

        var tr = document.createElement("tr");
        var th = setElement("th", {}, "위치");
        var td = document.createElement("td");
        var input = setElement("input", {"type": "text", "id": "inputLocation"});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);

        tr = document.createElement("tr");
        th = setElement("th", {}, "제목");
        td = document.createElement("td");
        input = setElement("input", {"type": "text", "id": "inputTitle"});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);

        tr = document.createElement("tr");
        th = setElement("th", {}, "일정");
        td = document.createElement("td");
        input = setElement("input", {"type": "date", "id": "startDate", "value": strDate});
        td.appendChild(input);
        input = setElement("span", {}, " ~ ");
        td.appendChild(input);
        input = setElement("input", {"type": "date", "id": "endDate", "value": strDate});
        td.appendChild(input);
        tr.appendChild(th);
        tr.appendChild(td);
        table.appendChild(tr);
        childDiv.appendChild(table);
        div.appendChild(childDiv);

        childDiv = setElement("div", {"id": "sm_setCalendar_textWrapper"});
        var textarea = setElement("textarea", {"id": "sm_setCalendar_tiny"});
        childDiv.appendChild(textarea);
        div.appendChild(childDiv);
        wrapperDiv.appendChild(div);

        $("#save").on("click", function(){
            var location = $("#inputLocation").val();
            var title = $("#inputTitle").val();
            var startDate = $("#startDate").val();
            var endDate = $("#endDate").val();
            var content = tinymce.get("sm_setCalendar_tiny").getContent();

            if(title == null || title ==""){
                alert("제목을 입력해주세요");
                $("#inputTitle").focus();
                return;
            }

            if(startDate == null || startDate == ""){
                alert("일정 시작일을 지정해주세요");
                $("#startDate").focus();
                return;
            }else{
                startDate = getUTCTime(startDate);
            }

            if(endDate == null || endDate == ""){
                alert("일정 마감일을 지정해주세요");
                $("#endDate").focus();
                return;
            }else{
                endDate = getUTCTime(endDate);
            }

            if(startDate > endDate){
                alert("일정 시작일이 마감일보다 늦은 날짜일 수 없습니다");
                $("#startDate").focus();
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
                        alert("일정이 추가되었습니다");
                        calendarObj.opener.postMessage({reload: 1}, calendarObj.opener.location);
                        window.close();
                    }
                },
                error: function (err) {
                    console.log(err);
                }
            });

        });

        $("#close").on("click", function(){
            window.close();
        });

        tinymce.init(calendarObj.tinyOption);
    },
}