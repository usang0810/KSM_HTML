// 사용자, 기기 편집에 필요한 인덱스 값 전역 변수로 선언
let userIdx;
let machineIdx;

// 값 복사용 객체 선언
let copyData = {
    model: "",
    cpu: "",
    ssd1: "",
    ssd2: "",
    ssd3: "",
    hdd1: "",
    hdd2: "",
    hdd3: "",
    mem: "",
    os: "",
    vga: "",
    fromdate: "",
    updatedate: "",
    position: "",
    status: "",
    price: "",
    etc: ""
};

window.onload = function () {
    // 시작 시 사용자 리스트 출력
    userListLoad();

    // 서브메뉴 클릭 시 복사, 붙여넣기, 공지사항 토글
    $("#subMenu").click(function(){
        $(".machineManage").fadeToggle(300);
        $("#notice").fadeToggle(300);
    });
    
    // ctrl + alt + c 버튼으로 기기관리 내용 복사
    $(document).keydown(function(event) {
        if(event.which == 67 && event.ctrlKey && event.altKey ) {
            machineCopy();
        }
    });

    // ctrl + alt + v 버튼으로 기기관리 내용 붙여넣기
    $(document).keydown(function(event) {
        if(event.which == 86 && event.ctrlKey && event.altKey ) {
            machinePaste();
        }
    });
}
// 사용자 등록
function setUser() {
    var devNo = $("#inputDevNo").val();
    var user = $("#inputUser").val();
    var useDate = $("#inputUseDate").val();
    var returnDate = $("#inputReturnDate").val();
    var etc = $("#useRemark").val();

    // 유효성 검사
    if (devNo == "") {
        alert("기기번호를 입력해주세요.");
        $("#inputDevNo").focus();
        return;
    } else if (user == "") {
        alert("사용자명을 입력해주세요.");
        $("#inputUser").focus();
        return;
    } else if (useDate == "") {
        alert("사용일자를 입력해주세요.");
        $("#inputUseDate").focus();
        return;
    }

    var toggleVal = $("#useToggleBtn").val();
    if (toggleVal == "등록") {

        // 등록확인 컨펌창
        if(confirm("'" + devNo + "'기기에 대한 사용자 히스토리를 등록하시겠습니까?")){
            // 사용자 등록 ajax
            $.ajax({
                url: "http://203.109.30.208:8585/setUser",
                type: "put",
                data: {
                    no: devNo,
                    name: user,
                    usedate: sendFormatter(useDate),
                    returndate: sendFormatter(returnDate),
                    etc: etc
                },
                success: function (result) {
                    alert("'" + devNo + "'기기에 대한 사용자 히스토리가 등록되었습니다.");
                    userReload();
                },
                error: function (err) {
                    console.log("사용 등록 실패");
                    console.log(err);
                }
            });
        }

    // 사용자 편집
    } else if (toggleVal == "편집") {

        if(confirm("'" + devNo + "'기기에 대한 사용자 히스토리 내용을 편집하시겠습니까?")){
            $.ajax({
                url: "http://203.109.30.208:8585/updateUser",
                type: "put",
                data: {
                    idx: userIdx,
                    no: devNo,
                    name: user,
                    usedate: sendFormatter(useDate),
                    returndate: sendFormatter(returnDate),
                    etc: etc
                },
                success: function (result) {
                    alert("'" + devNo + "'기기에 대한 사용자 히스토리가 편집되었습니다.");
                    userReload();
                },
                error: function (err) {
                    console.log("ajax 통신 실패");
                    console.log(err);
                }
            });
        }
    }
}

// 매개변수에 this쓰면 에러
function getUserList(obj) {
    var idx = $(obj).children(".idx").text(); // 사용자가 클릭한 index 번호
    var no = $(obj).children(".no").text();
    var name = $(obj).children("input").val();

    $.ajax({
        url: "http://203.109.30.208:8585/getUserList",
        dataType: "json",
        type: "get",
        data: {
            no: no,
            name: name
        },
        success: function (result) {

            var resultUser = null;
            // 클릭한 index번호와 result의 index번호가 일치해야함
            for(var i=0; i<result.result.length; i++){
                if(idx == result.result[i].idx){
                    resultUser = result.result[i];
                    break;
                }
            }
            // console.log("return 값 : " + resultUser.no + " " + resultUser.name + " "
            //     + resultUser.usedate + " " + resultUser.returndate + " " + resultUser.etc);
            $("#inputDevNo").val(resultUser.no);
            $("#inputUser").val(resultUser.name);
            $("#inputUseDate").val(dateFormatter(resultUser.usedate));
            $("#inputReturnDate").val(dateFormatter(resultUser.returndate));
            $("#useRemark").val(resultUser.etc);
            $("#devNo").text(resultUser.no);

            userIdx = resultUser.idx;

            originBGColor("#userListTable");
            changeBGColor(obj);
            $("#inputDevNo").attr("disabled", true);
            $("#useToggleBtn").val("편집");
            $("#clearUseBtn").show();
            getMachineList(no);
        },
        error: function (err) {
            console.log("ajax 통신 실패");
            console.log(err);
        }
    });
}

// yyyyMMdd -> yyyy-MM-dd로 날짜 형식 변환
function dateFormatter(date) {
    // 날짜 유효성 검사
    if (date.length != 8) {
        return "";
    }

    var dateArr = [];
    dateArr.push(date.slice(0, 4));
    dateArr.push(date.slice(4, 6));
    dateArr.push(date.slice(6, 8));
    return dateArr[0] + '-' + dateArr[1] + '-' + dateArr[2];
}

// yyyy-MM-dd -> yyyyMMdd로 값 전달용으로 변환
function sendFormatter(date){
    // 날짜 유효성 검사
    if(date.length != 10){
        return "";
    }

    date = date.split("-");
    return date[0] + date[1] + date[2];
}

// 사용 등록/편집 화면 초기화
function clearUserForm() {
    $("#inputDevNo").val("");
    $("#inputUser").val("");
    $("#inputUseDate").val("");
    $("#inputReturnDate").val("");
    $("#useRemark").val("");
    $("#inputDevNo").attr("disabled", false);
    $("#useToggleBtn").val("등록");
    $("#clearUseBtn").hide();
    originBGColor("#userListTable");
    $("#devNo").text("");
    clearMachineForm();
    clearMachineList();

    userIdx = null;
}

function clearMachineForm(){
    $("#inputModel").val("");
    $("#inputCpu").val("");
    $("#inputSSD1").val("");
    $("#inputSSD2").val("");
    $("#inputSSD3").val("");
    $("#inputHDD1").val("");
    $("#inputHDD2").val("");
    $("#inputHDD3").val("");
    $("#inputMem").val("");
    $("#inputOS").val("");
    $("#inputVGA").val("");
    $("#inputUseDate2").val("");
    $("#inputReturnDate2").val("");
    $("#inputPosition").val("");
    $("#inputStat").val("양호").prop("selected", true);
    $("#inputPrice").val("");
    $("#devRemark").val("");
    $("#devToggleBtn").val("등록");
    $("#clearMachineBtn").hide();

    machineIdx = null;
    originBGColor("#machineListTable");
}

// 기기 관리 등록/편집
function setMachine(){

    var toggleVal = $("#devToggleBtn").val();
    var no = $("#devNo").text();
    if(no == ""){
        alert("기기를 먼저 선택해주세요");
        return;
    }

    if(toggleVal == "등록"){

        // 기기관리 등록 확인창
        if(confirm("'" + no + "'기기에 대한 히스토리를 등록하시겠습니까?")){
            $.ajax({
                url: "http://203.109.30.208:8585/setMachine",
                type: "post",
                data: {no: no,
                    model: $("#inputModel").val(),
                    cpu: $("#inputCpu").val(),
                    ssd1: $("#inputSSD1").val(),
                    ssd2: $("#inputSSD2").val(),
                    ssd3: $("#inputSSD3").val(),
                    hdd1: $("#inputHDD1").val(),
                    hdd2: $("#inputHDD2").val(),
                    hdd3: $("#inputHDD3").val(),
                    mem: $("#inputMem").val(),
                    os: $("#inputOS").val(),
                    vga: $("#inputVGA").val(),
                    fromdate: sendFormatter($("#inputUseDate2").val()),
                    updatedate: sendFormatter($("#inputReturnDate2").val()),
                    location: $("#inputPosition").val(),
                    status: $("#inputStat").val(),
                    price: $("#inputPrice").val(),
                    etc: $("#devRemark").val()},
                success: function (result) {
                    alert("'" + no + "'기기에 대한 히스토리가 등록되었습니다.");
                    machineReload(no);
        
                },
                error: function (err) {
                    console.log("ajax 통신 실패");
                    console.log(err);
                }
            });
        }

    }else if(toggleVal == "편집"){

        // 기기관리 편집 확인창
        if(confirm("'" + no + "'기기에 대한 히스토리를 편집하시겠습니까?")){
            $.ajax({
                url: "http://203.109.30.208:8585/updateMachine",
                type: "post",
                data: {idx: machineIdx,
                    model: $("#inputModel").val(),
                    cpu: $("#inputCpu").val(),
                    ssd1: $("#inputSSD1").val(),
                    ssd2: $("#inputSSD2").val(),
                    ssd3: $("#inputSSD3").val(),
                    hdd1: $("#inputHDD1").val(),
                    hdd2: $("#inputHDD2").val(),
                    hdd3: $("#inputHDD3").val(),
                    mem: $("#inputMem").val(),
                    os: $("#inputOS").val(),
                    vga: $("#inputVGA").val(),
                    fromdate: sendFormatter($("#inputUseDate2").val()),
                    updatedate: sendFormatter($("#inputReturnDate2").val()),
                    location: $("#inputPosition").val(),
                    status: $("#inputStat").val(),
                    price: $("#inputPrice").val(),
                    etc: $("#devRemark").val()},
                success: function (result) {
                    alert("'" + no + "'기기에 대한 히스토리가 편집되었습니다.");
                    getMachineList(no);
        
                },
                error: function (err) {
                    console.log("ajax 통신 실패");
                    console.log(err);
                }
            });
        }
    }
}

// 기기 목록 조회
function getMachineList(no) {
    if(no == ""){
        alert("기기를 선택해주세요");
        return;
    }

    $.ajax({
        url: "http://203.109.30.208:8585/getMachineList",
        type: "get",
        data: { no: no },
        success: function (result) {
            clearMachineForm();
            clearMachineList();

            var arr = result.result;
            for (var i = 0; i < arr.length; i++) {

                var html = "<tr onclick='machineDetail(this);'>"
                    + "<td class='idx'>" + arr[i].idx + "</td>"
                    + "<td>" + (arr[i].model == null ? "" : arr[i].model) + "</td>"
                    + "<td>" + arr[i].cpu + "</td>"
                    + "<td>" + arr[i].ssd1 + "</td>"
                    + "<td>" + arr[i].ssd2 + "</td>"
                    + "<td>" + arr[i].ssd3 + "</td>"
                    + "<td>" + arr[i].hdd1 + "</td>"
                    + "<td>" + arr[i].hdd2 + "</td>"
                    + "<td>" + arr[i].hdd3 + "</td>"
                    + "<td>" + (arr[i].mem == null ? "" : arr[i].mem) + "</td>"
                    + "<td>" + arr[i].os + "</td>"
                    + "<td>" + arr[i].vga + "</td>"
                    + "<td>" + arr[i].fromdate + "</td>"
                    + "<td>" + arr[i].updatedate + "</td>"
                    + "<td>" + arr[i].location + "</td>"
                    + "<td>" + (arr[i].status == null ? "" : arr[i].status) + "</td>"
                    + "<td>" + (arr[i].price == null ? "" : arr[i].price) + "</td>"
                    + "<td>" + arr[i].etc + "</td>"
                    + "<td><button class='del-btn' onclick='delMachine(this);'>&#10006;</button></td>"
                    + "</tr>";
                $("#machineListTable").append(html);
            }
        },
        error: function (err) {
            console.log("ajax 통신 실패");
            console.log(err);
        }
    });
}

function machineDetail(obj){
    var detail = $(obj).children();
    machineIdx = $(detail[0]).text();
    $("#inputModel").val($(detail[1]).text());
    $("#inputCpu").val($(detail[2]).text());
    $("#inputSSD1").val($(detail[3]).text());
    $("#inputSSD2").val($(detail[4]).text());
    $("#inputSSD3").val($(detail[5]).text());
    $("#inputHDD1").val($(detail[6]).text());
    $("#inputHDD2").val($(detail[7]).text());
    $("#inputHDD3").val($(detail[8]).text());
    $("#inputMem").val($(detail[9]).text());
    $("#inputOS").val($(detail[10]).text());
    $("#inputVGA").val($(detail[11]).text());
    $("#inputUseDate2").val(dateFormatter($(detail[12]).text()));
    $("#inputReturnDate2").val(dateFormatter($(detail[13]).text()));
    $("#inputPosition").val($(detail[14]).text());
    $("#inputStat").val($(detail[15]).text()).prop("selected", true);
    $("#inputPrice").val($(detail[16]).text());
    $("#devRemark").val($(detail[17]).text());
    $("#devToggleBtn").val("편집");
    $("#clearMachineBtn").show();

    originBGColor("#machineListTable");
    changeBGColor(obj);
}

function clearUserList(){
    $("#userListTable tr:not(:first)").remove();
}

function clearMachineList(){
    $("#machineListTable tr:not(:first)").remove();
}

function userListLoad(){
    $.ajax({
        url: "http://203.109.30.208:8585/getUserList",
        type: "get",
        data: {},
        success: function (result) {
            for (var i = 0; i<result.result.length; i++) {
                var name = "";

                // name값이 undefined일 때 에러 발생, 흐름에는 지장 없음
                if (result.result[i].name != "undefined") {
                    name = result.result[i].name;
                }

                var html = "<tr onclick='getUserList(this);'>"
                    + "<input type='hidden' value=" + name + ">" // 반환되는 name값
                    + "<td class='idx'>" + result.result[i].idx + "</td>"
                    + "<td class='no'>" + result.result[i].no + "</td>"
                    + "<td class='usedate'>" + result.result[i].usedate + "</td>"
                    + "<td class='returndate'>" + result.result[i].returndate + "</td>"
                    + "<td><button class='del-btn' onclick='delUser(this);'>&#10006;</button></td>"
                    + "</tr>";
                $("#userListTable").append(html);
            }
        },
        error: function (err) {
            console.log("ajax 통신 실패");
            console.log(err);
        }
    });
}

// 목록 선택시 배경색 변경용 함수
function changeBGColor(obj){
    $(obj).addClass("yellowBG");
}

// 원래 색상으로 되돌리기용 함수
function originBGColor(id){
    $(id + " .yellowBG").removeClass("yellowBG");
}

// 기기에 대한 사용자 히스토리 삭제
// param=idx, method=put
// 기기명이 출력되는 컨펌창 확인 후 삭제
// 삭제 후 경고창 출력
function delUser(obj){
    var idx = $(obj).parent().parent().children(".idx").text();
    var no = $(obj).parent().parent().children(".no").text();

    // 사용자 히스토리 삭제 확인창
    if(confirm("'" + no + "'기기에 대한 사용자 히스토리를 삭제하시겠습니까?")){
        $.ajax({
            url: "http://203.109.30.208:8585/deleteUser",
            type: "put",
            data: {idx: idx},
            success: function (result) {
                userReload();
                alert("'" + no + "'기기에 대한 사용자 히스토리가 삭제되었습니다.");
            },
            error: function (err) {
                console.log("ajax 통신 실패");
                console.log(err);
            }
        });
    }
}

// 기기 히스토리 삭제
// param=idx, method=put
function delMachine(obj){
    var idx = $(obj).parent().parent().children(".idx").text();
    var no = $("#devNo").text();

    // 사용자 히스토리 삭제 확인창
    if(confirm("'" + no + "'기기에 대한 히스토리를 삭제하시겠습니까?")){
        $.ajax({
            url: "http://203.109.30.208:8585/deleteMachine",
            type: "put",
            data: {idx: idx},
            success: function (result) {
                getMachineList(no);
                alert("'" + no + "'기기에 대한 히스토리가 삭제되었습니다.");
            },
            error: function (err) {
                console.log("ajax 통신 실패");
                console.log(err);
            }
        });
    }
}

// 현재 기기관리 화면 내용 전부 복사
function machineCopy(){
    copyData.model = $("#inputModel").val();
    copyData.cpu = $("#inputCpu").val();
    copyData.ssd1 = $("#inputSSD1").val();
    copyData.ssd2 = $("#inputSSD2").val();
    copyData.ssd3 = $("#inputSSD3").val();
    copyData.hdd1 = $("#inputHDD1").val();
    copyData.hdd2 = $("#inputHDD2").val();
    copyData.hdd3 = $("#inputHDD3").val();
    copyData.mem = $("#inputMem").val();
    copyData.os = $("#inputOS").val();
    copyData.vga = $("#inputVGA").val();
    copyData.fromdate = $("#inputUseDate2").val();
    copyData.updatedate = $("#inputReturnDate2").val();
    copyData.location = $("#inputPosition").val();
    copyData.status = $("#inputStat").val();
    copyData.price = $("#inputPrice").val();
    copyData.etc = $("#devRemark").val();
    alert("복사가 완료되었습니다.");
}

// 현재 기기관리 화면에 복사했던 내용 붙여넣기
function machinePaste(){
    $("#inputModel").val(copyData.model);
    $("#inputCpu").val(copyData.cpu);
    $("#inputSSD1").val(copyData.ssd1);
    $("#inputSSD2").val(copyData.ssd2);
    $("#inputSSD3").val(copyData.ssd3);
    $("#inputHDD1").val(copyData.hdd1);
    $("#inputHDD2").val(copyData.hdd2);
    $("#inputHDD3").val(copyData.hdd3);
    $("#inputMem").val(copyData.mem);
    $("#inputOS").val(copyData.os);
    $("#inputVGA").val(copyData.vga);
    $("#inputUseDate2").val(copyData.fromdate);
    $("#inputReturnDate2").val(copyData.updatedate);
    $("#inputPosition").val(copyData.location);
    $("#inputStat").val(copyData.status);
    $("#inputPrice").val(copyData.price);
    $("#devRemark").val(copyData.etc);
}

// 사용자 히스토리 목록 재조회
function userReload(){
    clearUserForm();
    clearUserList();
    userListLoad();
}

// 기기관리 히스토리 목록 재조회
function machineReload(){
    var no = $("#devNo").text();
    clearMachineForm();
    clearMachineList();
    getMachineList(no);
}