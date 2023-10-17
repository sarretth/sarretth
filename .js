var divs = new Array();

var listreps;

var maxDistance = 100000;

var currentjobnum;

var currentidx;

var currentStoreID;

var ismobile = false;

var timeObjectToUpdateInSchedule;

var expectedWorkHoursFromJob = 0;

var storeschedulecolumnsorted = 0;

var dateschedulecounter = 0;

var distanceTolerance = 1.1; //Tolerance by Mile when to display the rep's checkin/checkout distance
//==========================================================================
/*
These objects is used to set the default values when entering new schedule
*/
var jobdefaultmileagetype;
var jobdefaultmileagepayablerate;
var jobdefaultmileagebillablerate;
//==========================================================================

/*
==========================================
==========================================
These functions are used for the calendar
==========================================
==========================================
*/

var dates = new Array();

function addDate(date) { if (jQuery.inArray(date, dates) < 0) dates.push(date); }

function removeDate(index) {
    dates.splice(index, 1);
}

// Adds a date if we don't have it yet, else remove it
function addOrRemoveDateFromScheduler(date) {

    //var index = jQuery.inArray(date, dates);
    //if (index >= 0) {
    //var d = date.replace(/-|\//g, "");
    //$('#schedulerow_' + d.toString()).remove();

    //removeDate(index);
    //}
    //else {
    addDate(date);
    dateschedulecounter++;
    var hrs = getDefaultExpectedWorkHours();
    addRowToSchedule(date, 0, 0, 0, "", "", "", hrs, 0, 0, 0, 0, 0, "", false, false, false, 0, jobdefaultmileagebillablerate, jobdefaultmileagetype, jobdefaultmileagepayablerate, '', '', 0, 0);
    calendarStatus("inlinecalendar", false);
    //}
}

function getDefaultExpectedWorkHours() {
    var hrs = 0;
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetDefaultExpectedWorkHours",
        data: "{jobnum: " + currentjobnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            hrs = data.d;
        },
        error: AjaxFailed
    });       //end ajax
    return hrs;
}

function getExpectedWorkHours(idx) {
    var hrs = 0;
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetExpectedWorkHours",
        data: "{idx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            hrs = data.d;
        },
        error: AjaxFailed
    });       //end ajax
    return hrs;
}

function getpayrate(repid, id) {
    var s = repid.substring(10);
    var obj = document.getElementById("\'" + repid + "\'");
    var repnum = document.getElementById("\'" + repid + "\'").value;
    if (isNaN(repnum) === false) {
        $.ajax({
            async: false,
            type: "POST",
            url: "forceoneData.asmx/GetPayrateByRepNum",
            beforeSend: function () {
                $("#divLoader").css({ "display": "block" });
            },
            data: "{repnum: " + repnum + "}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                var pay = data.d;
                if (pay >= 0) {
                    $("#scheduler_payrate_" + s).val(pay);
                    $(obj).css("border-color", "#00FF00");
                    $(obj).css("box-shadow", "0 0 0 0.2rem #00FF00");
                }
            },
            error: AjaxFailed
        });
        $("#divLoader").css({ "display": "none" })
    }
    else {
        $(obj).css("border-color", "#ff0000");
        $(obj).css("box-shadow", "0 0 0 0.2rem #ff0000");
        alert("Please enter a valid Rep ID #!");
    }
}

function getEmployeeInfo(repnum) {
    var employeeInfo = '';
    $.ajax({
        type: "POST",
        async: false,
        url: "forceoneData.asmx/GetEmployeeInfo",
        data: "{repnum: " + repnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            rep = data.d;
            employeeInfo = rep.FirstName + ' ' + rep.LastName + ' - ' + repnum;
        },
        error: AjaxFailed
    });
    return employeeInfo;
}

/*
expectedworkhours: comes from job default
totalexpectedhourswork: comes from the excel file when imported
*/
function addRowToSchedule(date, repnum, idx, idfjobstoresassigned, t_timein, t_timeout, comment, expectedworkhours, billtype, mileage, payrate, totalexpectedhourswork, miscexpense, miscexpensereason, complete, surveyrequired, surveycomplete, photocount, billmileagecost, mileagetype, mileagepayablerate, managernote, adminnote, parentIDx, Cases) {
    var d = date.replace(/-|\//g, "");
    var id;
    var s = '';
    var hidValue = 0;
    if (idx == undefined) { idx = 0; }
    if (idx != 0) { hidValue = idx.toString(); }
    if (idx) id = idx; else id = d.toString() + "_" + dateschedulecounter.toString();

    //$('#schedulerow_' + d.toString()).remove();
    var empname = getEmployeeInfo(repnum);
    var newlistreps = listreps.replace('value="' + repnum.toString() + '"', 'value="' + repnum.toString() + '" selected ').replace("Select a Merchandiser", empname);

    var lnkChangeDate = ''
    if (idx) {
        if (!isclient) {
            if (!complete) {
                lnkChangeDate = '<div id="divscheduler_date_idx_' + idx.toString() + '"><a id="lnkscheduler_date_idx_' + idx.toString() + '" href="javascript:;" onclick="changedate(' + idx.toString() + ',\'' + date.toString() + '\')">' + date.toString() + '</a></div>';
            }
            else {
                lnkChangeDate = date.toString();
            }
        }
        else {
            lnkChangeDate = date.toString();
        }
    }
    else {
        lnkChangeDate = date.toString();
    }

    s += '<tr id="schedulerow_' + id.toString() + '">';
    s += '  <td id="scheduledatecell">' + lnkChangeDate + '</td>';
    s += '  <td id="schedulerepcell"><a name="a_scheduler_reps_' + d.toString() + '" />' + newlistreps.replace(/scheduler_reps/g, "scheduler_reps_" + id.toString()).replace(/payBox/g, "\'scheduler_"  + id + "\'").replace(/Select a Merchandiser/g, repnum.toString() + $(this).children('td').eq(1).find('option').filter(':selected').text()) + '<br />';
    s += '      <table class="table" style="border-collapse:collapse; border:0px; height:60px; cell-padding:0px; cell-spacing:0px;"><thead></thead><tbody>';
    s += '          <tr><td colspan="2"><a name="#schedule' + id.toString() + '" /><div id="schedulerdiv_err_' + id.toString() + '"></div></td></tr>';

    if (yilesed || teamlead) {
        s += '          <tr><td>Pay Rate</td><td><div id = "divscheduler_payrate_' + id.toString() + '"></div></td></tr>';
    }
    else {
        s += '          <tr><td></td><td><div id = "divscheduler_payrate_' + id.toString() + '"></div></td></tr>';
    }

    s += '          <tr><td>Expected Time:</td><td><div id = "divscheduler_expectedtimein_' + id.toString() + '"></div></td></tr>';

    s += '          <tr><td>Start Time</td><td><div id = "divscheduler_timein_' + id.toString() + '"></div></td></tr>';
    s += '          <tr><td>End Time</td><td><div id = "divscheduler_timeout_' + id.toString() + '"></div></td></tr>';

    s += '          <tr><td>Mileage</td><td><div id = "divscheduler_mileage_' + id.toString() + '"></div></td></tr>';

    if (yilesed || teamlead) {
        s += '      <tr><td>Mileage Type</td><td><div id="divscheduler_mileagetype_' + id.toString() + '"></div></td></tr>';
        s += '      <tr><td>Mileage Payable Rate</td><td><div id="divscheduler_mileagepayablerate_' + id.toString() + '"></div></td></tr>';

    }

    if (yilesed || teamlead) {
        s += '      <tr><td>Mileage Billable Rate</td><td><div id="divscheduler_mileagebillablerate_' + id.toString() + '"></div></td></tr>';
    }

    s += '          <tr><td colspan="2">Merchandiser\'s Comment<br /><div id = "divcomment_' + id.toString() + '"><input type="hidden" id="scheduler_parentIDx_' + id.toString() + '" value="' + parentIDx + '" /></div></td></tr>';

    var expectedworkhourstext = '';

    if (totalexpectedhourswork > 0) {
        expectedworkhourscalc = totalexpectedhourswork;
        expectedworkhourstext = totalexpectedhourswork + ' hours';
    }
    else {
        if (expectedworkhours == 0) {
            expectedworkhourstext = 'Less than an hour.';
        }
        else if (expectedworkhours == 1) {
            expectedworkhourstext = 'An hour or so';
        }
        else { expectedworkhourstext = expectedworkhours + ' hours' }
    }

    //expectedworkhourstext


    s += '          <tr><td>Days</td><td><div id="divscheduler_workdays_' + id.toString() + '">0</div></td></tr>';
    s += '          <tr><td>Hours</td><td><div id="divscheduler_workhours_' + id.toString() + '">0</div></td></tr>';
    s += '          <tr><td>Minutes</td><td><div id="divscheduler_workminutes_' + id.toString() + '">0</div></td></tr>';

    if (yilesed || teamlead) {//' + expectedworkhourstext + '
        s += '          <tr><td>Expected Work Hours</td><td><div id="divscheduler_expectedworkhours_' + id.toString() + '"></div></td></tr>';
        s += '          <tr><td>Calculated Hours</td><td><div id="divscheduler_calchours_' + id.toString() + '"></div></td></tr>';
        s += '          <tr><td>Cases</td><td><div id="divscheduler_cases_' + id.toString() + '"></div></td></tr>';
    }
    else {
        s += '          <tr><td>Expected Work Hours</td><td>' + expectedworkhourstext + '</td></tr>';
    }

    if (yilesed || teamlead) {//' + miscexpense + '
        s += '          <tr><td>Misc Expense</td><td><div id="divscheduler_miscexpense_' + id.toString() + '"></div></td></tr>';
        s += '          <tr><td>Misc Exp. Reason</td><td><div id="divscheduler_miscexpensereason_' + id.toString() + '"></div></td></tr>';
        s += '          <tr><td><a href="#" onclick="return false;" title="This note is visible to the reps.">Manager Note</a></td><td><div id="divscheduler_managernote_' + id.toString() + '"></div></td></tr>';
        s += '          <tr><td><a href="#" onclick="return false;" title="This note is only visible for managers.">Admin Note</a></td><td><div id="divscheduler_adminnote_' + id.toString() + '"></div></td></tr>';
    }

    s += '          <tr><td colspan="2">'

    if (!isclient) {
        if (!complete) {
            if (isNaN(id.toString())) {
                s += '<a href="javascript:;" target="_blank">full page not available</a>';
            }
            else {
                s += '<a href="task.aspx?idx=' + id.toString() + '&date=' + left(date, 5) + '" target="_blank">full page</a>';
            }
        }
    }

    s += '              <input type = "hidden" id="hidExpectedWorkHours_' + id.toString() + '" value="' + expectedworkhours + '" />';
    s += '              <input type = "hidden" id="hidCases_' + id.toString() + '" value="' + cases + '" />';
    s += '              <input type = "hidden" id="hidmiscexpense_' + id.toString() + '" value ="' + miscexpense + '" />';
    s += '              <input type = "hidden" id="hidmiscexpensereason_' + id.toString() + '" value = "' + miscexpensereason + '" />';
    s += '              <input type = "hidden" id="hidbilltype_' + id.toString() + '" value = "' + billtype + '" />';
    s += '              <input type = "hidden" id="hcomplete_idx_' + id.toString() + '" value = "' + complete + '" />';
    s += '          </td></tr>';

    s += '          </tbody>';
    s += '      </table>';
    s += '  </td>';
    s += '  <td>';

    if (yilesed) {
        if (!complete || teamlead) {
            s += '<button  type="button" class="btn btn-danger" style="width= "auto" onclick="deleteschedule(' + idx.toString() + ', \'' + date + '\')"><i class="bi bi-calendar-x"></i></button><br />';
        }
    }

    if (idx) {
        s += '  <input type="hidden" id="hididx_' + idx.toString() + '" value="' + idx.toString() + '" />';

        if (!surveycomplete && surveyrequired == true) {
            s += '  <button  type="button" class="btn btn-warning" style="width= "auto" id="alinkSchedule_' + id + '" data-bs-toggle="modal" data-bs-target="#divAnswerSurvey" onclick="getSurveyGroup(' + currentjobnum + ', ' + idx + ',0,\'\'); $(\'#divAnswerSurvey\').css({\'display\' : \'block\'});"><i class="bi bi-card-checklist"></i></button>';
        }
        else if (surveycomplete && surveyrequired == true) {
            s += '  <button  type="button" class="btn btn-success" style="width= "auto"  id="alinkSchedule_' + id + '" data-bs-toggle="modal" data-bs-target="#divAnswerSurvey" onclick="getSurveyGroup(' + currentjobnum + ', ' + idx + ',0,\'\'); $(\'#divAnswerSurvey\').css({\'display\' : \'block\'});"><i class="bi bi-card-checklist"></i></button>';
        }
        //upload div
        if (photocount == 0 || photocount == null) {
            s += '<button  type="button" class="btn btn-danger" style="width= "auto" id="alinkPictureUpload_' + id + '" onclick="openuploader(' + currentjobnum + ',' + idx + '); $(\'#floatingtitleuploader\').html(\'Upload File\'); return false;"><i class="bi bi-camera"></i></button>';
        }
        else {
            s += '<button type="button" class="btn btn-warning" style="width= "auto" id="alinkPictureUpload_' + id + '" onclick="openuploader(' + currentjobnum + ',' + idx + '); $(\'#floatingtitleuploader\').html(\'Upload File\'); return false;"><i class="bi bi-camera"></i></button>';
        }
        //show finish icon
        if (complete) {
            s += ' <i class="bi bi-camera-video-off-fill"></i>';
        }
    }

    s += '  </td>';
    s += '</tr>';
    $('#tblListOfSchedules > tbody:last').append(s);

    if (complete) {
        $("#scheduler" /*+ id.toString()*/).attr('disabled', '');
    }

    var exptimein = $('<input/>',
    {
        type: 'text',
        width: '70px',
        class: 'form-control',
        id: 'scheduler_expectedtimein_' + id.toString(),
        text: '',
        disabled: complete,
        style: 'margin-left:0px;'
    });

    var starttime = $('<input/>',
    {
        type: 'text',
        width: '70px',
        class: 'form-control',
        id: 'scheduler_timein_' + id.toString(),
        text: t_timein,
        disabled: complete,
        style: 'margin-left:0px;'
    });

    var endtime = $('<input/>',
    {
        type: 'text',
        class: 'form-control',
        width: '70px',
        id: 'scheduler_timeout_' + id.toString(),
        text: t_timeout,
        disabled: complete,
        style: 'margin-left:0px;'
    });

    if (billmileagecost == 0) {
        var mileage = $('<input/>',
        {
            type: 'text',
            class: 'form-control',
            width: '70px',
            id: 'scheduler_mileage_' + id.toString(),
            text: mileage,
            disabled: complete,
            style: 'margin-left:0px;'
        });
    }
    else {
        var mileage = $('<input/>',
        {
            type: 'text',
            width: '70px',
            class: 'form-control',
            id: 'scheduler_mileage_' + id.toString(),
            text: mileage,
            disabled: complete,
            style: 'margin-left:0px;'
        });
    }

    var tcomment = $('<textarea/>',
    {
        rows: '4',
        width: '285px',
        class: 'form-control',
        id: 'scheduler_comment_' + id.toString(),
        value: comment,
        disabled: complete,
        style: 'margin-left:0px;'
    });

    if (!yilesed && !teamlead) {
        var hidPayRate = $('<hidden/>',
        {
            type: 'hidden',
            id: 'scheduler_payrate_' + id.toString(),
            text: payrate
        });
        $("#divscheduler_payrate_" + id.toString()).append(hidPayRate);
    }

    if (yilesed || teamlead) {
        var txtmiscexpense = $('<input/>',
        {
            type: 'text',
            width: '70px',
            class: 'form-control',
            id: 'scheduler_miscexpense_' + id.toString(),
            text: miscexpense,
            disabled: complete,
            style: 'margin-left:0px;'
        });

        var txtmiscexpensereason = $('<input/>',
        {
            type: 'text',
            width: '70px',
            class: 'form-control',
            id: 'scheduler_miscexpensereason_' + id.toString(),
            text: miscexpensereason,
            disabled: complete,
            style: 'margin-left:0px;'
        });

        var xpectedhrs = $('<input/>',
        {
            type: 'text',
            width: '70px',
            class: 'form-control',
            id: 'scheduler_expectedworkhours_' + id.toString(),
            text: totalexpectedhourswork,
            disabled: complete,
            style: 'margin-left:0px;'
        });

        $(xpectedhrs).on('blur', function () {
            if (!$.isNumeric($(xpectedhrs).val())) {
                $.msgbox("Invalid number", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                $(xpectedhrs).val(0);
            }
        });

        var cases = $('<input/>',
            {
                type: 'text',
                width: '70px',
                class: 'form-control',
                id: 'scheduler_cases_' + id.toString(),
                text: Cases,
                disabled: "disabled",
                style: 'margin-left:0px;'
            });

        var txtpayrate = $('<input/>',
        {
            type: 'text',
            class: 'form-control',
            id: 'scheduler_payrate_' + id.toString(),
            text: payrate,
            disabled: complete,
            style: 'margin-left:0px;'
        });

        var txtmanagernote = $('<textarea/>',
        {
            rows: '3',
            class: 'form-control',
            id: 'scheduler_managernote_' + id.toString(),
            value: managernote,
            style: 'margin-left:0px;'
        });

        var txtadminnote = $('<textarea/>',
        {
            rows: '3',
            class: 'form-control',
            id: 'scheduler_adminnote_' + id.toString(),
            value: adminnote,
            style: 'margin-left:0px;'
        });
        var num = Cases / 23;
        $("#divscheduler_calchours_" + id.toString()).append(num.toFixed(2));
        $("#divscheduler_miscexpense_" + id.toString()).append(txtmiscexpense);
        $("#divscheduler_miscexpensereason_" + id.toString()).append(txtmiscexpensereason);
        $("#divscheduler_cases_" + id.toString()).append(cases);
        $("#divscheduler_expectedworkhours_" + id.toString()).append(xpectedhrs);
        $("#divscheduler_payrate_" + id.toString()).append(txtpayrate);
        $("#divscheduler_managernote_" + id.toString()).append(txtmanagernote);
        $("#divscheduler_adminnote_" + id.toString()).append(txtadminnote);

        //add an event for the rep drop down
        //put the rate into the pay rate input box - only if it's blank or zero
        $("#scheduler_reps_" + id.toString()).on('blur', function () {
            var opt = $("#scheduler_reps_" + id.toString() + " option:selected").text();
            //if ($("#scheduler_payrate_" + id.toString()).val() == "" || $("#scheduler_payrate_" + id.toString()).val() == "0") { /*This was requested to be removed by Heiko - to allow changing payrates by rep name chosen*/
            var pay = getSubStr(opt, "[", "]")
            if (pay != "") {
                pay = pay.replace("$", "");
                try {
                    if (parseFloat(pay) == 0) { pay = ""; }
                }
                catch (e) { if (pay == "0") { pay = ""; } }
            }
            $("#scheduler_payrate_" + id.toString()).val(pay);
            //}
        });

        $("#scheduler_reps_" + id.toString()).on('input', function () {
            var opt = $("#scheduler_reps_" + id.toString() + " option:selected").text();
            //if ($("#scheduler_payrate_" + id.toString()).val() == "" || $("#scheduler_payrate_" + id.toString()).val() == "0") { /*This was requested to be removed by Heiko - to allow changing payrates by rep name chosen*/
            var pay = getSubStr(opt, "[", "]")
            if (pay != "") {
                pay = pay.replace("$", "");
                try {
                    if (parseFloat(pay) == 0) { pay = ""; }
                }
                catch (e) { if (pay == "0") { pay = ""; } }

            }
            $("#scheduler_payrate_" + id.toString()).val(pay);
            //}
        });

        /*************************************************************************/
        /*
        MileageType	1	Per Mile
        MileageType	2	Flat Rate
        MileageType 0   No Mileage Required
        */
        var sMileageTypeSel = "<select id='scheduler_mileagetype_" + id.toString() + "' ";

        if (complete == true || mileagetype== 2) {
            sMileageTypeSel += " disabled ";
        }

        sMileageTypeSel += "' ><option value='1' ";

        if (mileagetype == 1) {
            sMileageTypeSel += " Selected ";
        }

        sMileageTypeSel += ">Per Mile</option><option value='2'";

        if (mileagetype == 2) {
            sMileageTypeSel += " Selected ";
        }

        sMileageTypeSel += ">Flat Rate</option><option value='0'";

        if (mileagetype == 0) {
            sMileageTypeSel += " Selected ";
        }
        sMileageTypeSel += ">No Mileage Required</option></select>";

        $('#divscheduler_mileagetype_' + id.toString()).html(sMileageTypeSel);
        /*************************************************************************/

        /*************************************************************************/
        var txtmileagepayablerate = $('<input/>',
        {
            type: 'text',
            class: 'form-control',
            id: 'scheduler_mileagepayablerate_' + id.toString(),
            value: mileagepayablerate,
            disabled: complete,
            style: 'margin-left:0px;'
        });
        $("#divscheduler_mileagepayablerate_" + id.toString()).html(txtmileagepayablerate);

        /*************************************************************************/

        /*************************************************************************/
        var txtmileagebillablerate = $('<input/>',
        {
            type: 'text',
            class: 'form-control',
            id: 'scheduler_mileagebillablerate_' + id.toString(),
            value: billmileagecost,
            disabled: complete,
            style: 'margin-left:0px;'
        });
        $("#divscheduler_mileagebillablerate_" + id.toString()).html(txtmileagebillablerate);

        /*************************************************************************/

        $("#scheduler_miscexpense_" + id.toString()).val(miscexpense);
        $("#scheduler_miscexpensereason_" + id.toString()).val(miscexpensereason);

        if (payrate > 0) {
            $("#scheduler_payrate_" + id.toString()).val(payrate);
        }

        if (totalexpectedhourswork > 0) {
            $(xpectedhrs).val(totalexpectedhourswork);
        }
        else {
            if (expectedworkhours == 0) {
                $(xpectedhrs).val(.75);
            }
            else {
                $(xpectedhrs).val(expectedworkhours);
            }
        }

        if (Cases > 0) {
            $(cases).val(Cases);
        }
        else {
            $(cases).val(0);
        }

        var dTimeIn = new Date("1/1/01 " + t_timein);
        var dTimeOut = new Date("1/1/01 " + t_timeout);

        if (dTimeOut < dTimeIn) {
            dTimeOut.setDate(dTimeOut.getDate() + 1);
        }

        var timelapse = dTimeOut.getTime() - dTimeIn.getTime();
        var daysDifference = Math.floor(timelapse / 1000 / 60 / 60 / 24);
        timelapse -= daysDifference * 1000 * 60 * 60 * 24

        var hoursDifference = Math.floor(timelapse / 1000 / 60 / 60);
        timelapse -= hoursDifference * 1000 * 60 * 60

        var minutesDifference = Math.floor(timelapse / 1000 / 60);
        timelapse -= minutesDifference * 1000 * 60

        $("#divscheduler_workdays_" + id.toString()).html(daysDifference);
        $("#divscheduler_workhours_" + id.toString()).html(hoursDifference);
        $("#divscheduler_workminutes_" + id.toString()).html(minutesDifference);


    }

    
    //Hook click event to time picker
    
    $(exptimein).click(function () {
        //var newTime = new Date('1/1/1753');
        //showPeriod: false//,
        //$(exptimein).timepicker('setTime', newTime);
        otxttimein = "scheduler_timein_" + id.toString();
        otxttimeout = "scheduler_timeout_" + id.toString();
        ocomments = "scheduler_comment_" + id.toString();
        olbldays = "divscheduler_workdays_" + id.toString();
        olblhours = "divscheduler_workhours_" + id.toString();
        olblminutes = "divscheduler_workminutes_" + id.toString();
        obilltype = "hidbilltype_" + id.toString();
        oexpectedworkhours = "hidExpectedWorkHours_" + id.toString();
        omileage = "scheduler_mileage_" + id.toString();

        toggleDiv("divHHMM", true, this);
        timeObjectToUpdateInSchedule = this;
        this.blur();
    });

    $(starttime).click(function () {
        //var newTime = new Date('1/1/1753');
        //showPeriod: false//,
        //$(starttime).timepicker('setTime', newTime);
        otxttimein = "scheduler_timein_" + id.toString();
        otxttimeout = "scheduler_timeout_" + id.toString();
        ocomments = "scheduler_comment_" + id.toString();
        olbldays = "divscheduler_workdays_" + id.toString();
        olblhours = "divscheduler_workhours_" + id.toString();
        olblminutes = "divscheduler_workminutes_" + id.toString();
        obilltype = "hidbilltype_" + id.toString();
        oexpectedworkhours = "hidExpectedWorkHours_" + id.toString();
        toggleDiv("divHHMM", true, this);
        timeObjectToUpdateInSchedule = this;
        this.blur();
    });

    $(endtime).click(function () {
        //var newTime = new Date('1/1/1753');
        //showPeriod: false//,
        //$(endtime).timepicker('setTime', newTime);
        otxttimein = "scheduler_timein_" + id.toString();
        otxttimeout = "scheduler_timeout_" + id.toString();
        ocomments = "scheduler_comment_" + id.toString();
        olbldays = "divscheduler_workdays_" + id.toString();
        olblhours = "divscheduler_workhours_" + id.toString();
        olblminutes = "divscheduler_workminutes_" + id.toString();
        obilltype = "hidbilltype_" + id.toString();
        oexpectedworkhours = "hidExpectedWorkHours_" + id.toString();
        toggleDiv("divHHMM", true, this);
        timeObjectToUpdateInSchedule = this;
        this.blur();
    });
    

    $("#divscheduler_expectedtimein_" + id.toString()).append(exptimein);
    $("#divscheduler_timein_" + id.toString()).append(starttime);
    $("#divscheduler_timeout_" + id.toString()).append(endtime);
    $("#divcomment_" + id.toString()).append(tcomment);
    $("#divscheduler_mileage_" + id.toString()).append(mileage);

    //$('#divListOfSchedules').animate({ 'scrollTop': $('#divListOfSchedules')[0].scrollHeight - 1468 }, "slow");
    //alert($('#divListOfSchedules')[0].scrollHeight);

}

function GetContactsByClientNumActiveOnly(ClientNum) {
    $.ajax({//Get Contacts by Client Num
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetContactsByClientNumActiveOnly",
        data: "{ClientNum: " + ClientNum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populateContacts(data);
            //$("#divUploader").css({ "display": "block", "z-index": "10000" });
        },
        error: AjaxFailed
    });          //end ajax
}

function populateContacts(data) {
    var s1 = "<select id='selMainContact'><option value = '0'>Select a contact person</option>";
    var s2 = "<select id='selSecondContact'><option value = '0'>Select a contact person</option>";
    var s3 = "<select id='selBillingContact'><option value = '0'>Select a contact person</option>";

    var d = data.d;
    jQuery.each(d, function (rec) {
        s1 += "<option value = '" + this.idfContactID + "'>" + this.FName + " " + this.LName + " " + setphone(this.MainPhone) + "</option>";
        s2 += "<option value = '" + this.idfContactID + "'>" + this.FName + " " + this.LName + " " + setphone(this.MainPhone) + "</option>";
        s3 += "<option value = '" + this.idfContactID + "'>" + this.FName + " " + this.LName + " " + setphone(this.MainPhone) + "</option>";
    });

    s1 += "</select>";
    s2 += "</select>";
    s3 += "</select>";

    $("#divMainContact").html(s1);
    $("#divSecondContact").html(s2);
    $("#divBillingContact").html(s3);
}

function openuploader(jobnum, idx) {
    currentjobnum = jobnum;
    currentidx = idx;

    $.ajax({//Save date by idx
        async: false,
        type: "POST",
        url: "forceoneData.asmx/SetCurrentJobNumIDx",
        data: "{jobnum: " + jobnum + ", idx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            $("#divUploader").css({ "display": "block", "z-index": "10000" });
        },
        error: AjaxFailed
    });          //end ajax
    getphotos(jobnum, idx);
}

function openPhotoViewer(jobnum, idx) {
    currentjobnum = jobnum;
    currentidx = idx;

    $.ajax({//Save date by idx
        async: false,
        type: "POST",
        url: "forceoneData.asmx/SetCurrentJobNumIDx",
        data: "{jobnum: " + jobnum + ", idx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            $("#divPhotoViewer").css({ "display": "block", "z-index": "10000" });
        },
        error: AjaxFailed
    });          //end ajax
    getphotoViewer(jobnum, idx);
}

function getphotos(jobnum, idx) {
    $.ajax({//Save date by idx
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetStorePhotos",
        data: "{jobnum: " + jobnum + ", idx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var s = '';
            var d = data.d;
            jQuery.each(d, function (rec) {
                s += '<table style="width:65px;height:90px;padding-right:5px;padding-bottom:5px;"><tr><td colspan="2"><a href="/images.ashx?filename=storephotos/' + String("00000" + jobnum).slice(-6) + "/" + this.Filename.replace('thumb_', '') + '" class="ui-lightbox" target="_blank"><img style="border-color:#787676; border:6px; max-height:300px; max-width:300px;" src="/images.ashx?filename=storephotos/' + String("00000" + jobnum).slice(-6) + "/" + this.Filename + '" alt="' + rec.Filename + '" /></a><a href="/storephotos/' + String("00000" + jobnum).slice(-6) + "/" + this.Filename.replace('thumb_', '') + '" class="preview"></a></td></tr><tr><td><button class="btn btn-danger" type="button" data-bs-toggle="tooltip" title="Delete Photo" href="#" onclick="deletephotobyfilename(\'' + this.Filename.replace('thumb_', '') + '\', ' + jobnum + ', ' + idx + ');" id="del"><i class="bi bi-trash"></i></button></td><td><button type="button" data-bs-toggle="tooltip" title="Update Store Comment" class="btn btn-info" href="javascript:void(0);" onclick="updatecommentbyfilename(' + this.fStorePhotoID + ', \'' + this.Comment.replace('\'', '') + '\');" id="del"><i class="bi bi-chat-right-fill"></i></button></td></tr></table>';
            });
            s = "<div style='background-color:White; width:260px; min-height:100px; padding-left:10px; padding-right:7px; padding-top:10px; padding-bottom:10px; -moz-border-radius: .5em .5em .5em .5em; border-radius: .5em .5em .5em .5em; text-align:center; '>" + s + "</div>";
            $("#divstorephotos").html(s);
        },
        error: AjaxFailed
    });               //end ajax
}

function getphotoViewer(jobnum, idx) {
    $.ajax({//Save date by idx
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetStorePhotos",
        data: "{jobnum: " + jobnum + ", idx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var s = '';
            var d = data.d;
            jQuery.each(d, function (rec) {
                s += '<table style="width:85px;height:90px;float:left;padding-right:5px;padding-bottom:5px;"><tr><td colspan="2"><a href="/images.ashx?filename=storephotos/' + String("00000" + jobnum).slice(-6) + "/" + this.Filename.replace('thumb_', '') + '" class="ui-lightbox" target="_blank"><img style="border-color:#787676; border:6px; height:70px; width:55px;" src="/storephotos/' + String("00000" + jobnum).slice(-6) + "/" + this.Filename + '" alt="' + rec.Filename + '" /></a><a href="/storephotos/' + String("00000" + jobnum).slice(-6) + "/" + this.Filename.replace('thumb_', '') + '" class="preview"></a></td></tr><tr><td>' + this.Comment.replace('\'', '') + '</td></tr></table>';
            });
            s = "<div style='background-color:White; width:265px; min-height:280px; padding-left:10px; padding-right:7px; padding-top:10px; padding-bottom:10px; -moz-border-radius: .5em .5em .5em .5em; border-radius: .5em .5em .5em .5em; text-align:center; '>" + s + "</div>";
            $("#divstorephotoviewer").html(s);
        },
        error: AjaxFailed
    });               //end ajax
}

function updatecommentbyfilename(id, comment) {

    $.msgbox("<p>Please enter your comment below.</p>", {
        type: "prompt",
        inputs: [
            { type: "text", label: "", value: comment, required: false }
        ],
        buttons: [
            { type: "submit", value: "OK" },
            { type: "cancel", value: "Exit" }
        ]
    }, function (newcomment) {
        if (newcomment) {
            savenewcomment(id, newcomment);
        }
    });
}

function savenewcomment(id, newcomment) {

    $.ajax({//Save date by idx
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateStorePhotoComment",
        data: "{fstorephotoid: " + id + ", newcomment: '" + Base64.encode(newcomment) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            $('#divComment' + id).text(newcomment);
        },
        error: AjaxFailed
    });          //end ajax
}

function changedate(idx, date) {

    $.msgbox("Enter new date:", {//ask for the new date
        type: "prompt"
    }, function (result) {
        if (result) {//evaluate date
            if (Date.parse(result)) {
                $.ajax({//Save date by idx
                    async: false,
                    type: "POST",
                    url: "forceoneData.asmx/UpdateSchedule",
                    data: "{idx: " + idx + ", date: '" + result + "'}",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        var lnkChangeDate = '';
                        lnkChangeDate = '<div id="divscheduler_date_idx_' + idx.toString() + '"><a id = "lnkscheduler_date_idx_' + idx.toString() + '" href="javascript:;" onclick="changedate(' + idx.toString() + ',\'' + result + '\')">' + result + '</a></div>';
                        $("#divscheduler_date_idx_" + idx.toString()).html(lnkChangeDate);
                    },
                    error: AjaxFailed
                });          //end ajax
            }
            else {
                $.msgbox("Invalid date.", { type: "info", buttons: [{ type: "submit", value: "Ok" }] });
            }
        }
    });

}

function validateTime(txttimein, txttimeout, hidexpectedHoursWork, txtcomment, hidbilltype) {

    var timein = $("#" + txttimein).val();
    var timeout = $("#" + txttimeout).val();
    var expectedHoursWork = $("#" + hidexpectedHoursWork).val();
    var comment = $("#" + txtcomment).val();
    var billtype = $("#" + hidbilltype).val();

    if (timeout == "" && timein == "") {
        return "ok";
    }

    if (timein != "") {
        if (isNaN(Date.parse("1/1/00 " + timein))) {
            return "Start time is not a valid time.";
        }
    }

    if (timeout != "") {
        if (isNaN(Date.parse("1/1/00 " + timeout))) {
            return "End time is not a valid time.";
        }
    }

    if (timeout == "" && timein != "")
    { return "ok"; }

    if (timeout != "" && timein == "") {
        return "Enter start time.";
    }

    var dTimeIn = new Date("1/1/00 " + timein);
    var dTimeOut = new Date("1/1/00 " + timeout);

    if (dTimeIn > dTimeOut) {
        dTimeOut.setDate(dTimeIn.getUTCDate() + 1);
    }

    if (billtype == "") {
        billtype = 1    //default to flat rate
    }

    var timelapse = (dTimeOut.getTime() - dTimeIn.getTime()) / 1000 / 60 / 60;
    //return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    if (timelapse < 0) {
        return "Start time and End time are not properly entered.";
    }

    if (expectedHoursWork == "") { expectedHoursWork = 0; }

    if (expectedHoursWork == 0) {
        expectedHoursWork = 1;
    }
    else if (expectedHoursWork == 1) {
        expectedHoursWork = 1.75;
    }

    if (timelapse >= 16) {
        return "Too much work hours entered.";
    }

    if (billtype == 2)//if hourly
    {
        if (timelapse > 16) {
            return "Start time and end time are not properly entered.";
        }

        if (timelapse > expectedHoursWork && comment == "") {//too much work hour without comment
            return "Please tell us why it's taking longer than expected.";
        }
        if (timelapse > expectedHoursWork && comment != "") {//too much work hour without comment
            return "ok";
        }
        else if (timelapse < expectedHoursWork) {
            return "ok";
        }
    }


    if (dTimeIn < dTimeOut) {
        return "ok";
    }
}

function deletephotobyfilename(filename, jobnum, idx) {

    $.msgbox("Are you sure you want to delete this photo?", {
        type: "confirm",
        buttons: [
            { type: "submit", value: "Yes" },
            { type: "submit", value: "No" },
            { type: "cancel", value: "Cancel" }
        ]
    }, function (result) {
        if (result == "Yes") {
            $.ajax({//Save date by idx
                async: false,
                type: "POST",
                url: "forceoneData.asmx/DeletePhoto",
                data: "{filename: '" + filename + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    getphotos(jobnum, idx);
                },
                error: AjaxFailed
            });          //end ajax
        }
    });
}

function validateTime2(txttimein, txttimeout, expectedHoursWork, txtcomment, hidbilltype) {

    var timein = $("#" + txttimein).val();
    var timeout = $("#" + txttimeout).val();
    var comment = $("#" + txtcomment).val();
    var billtype = $("#" + hidbilltype).val();

    if (timeout == "" && timein == "") {
        return "ok";
    }

    if (timein != "") {
        if (isNaN(Date.parse("1/1/00 " + timein))) {
            return "Start time is not a valid time.";
        }
    }

    if (timeout != "") {
        if (isNaN(Date.parse("1/1/00 " + timeout))) {
            return "End time is not a valid time.";
        }
    }

    if (timeout == "" && timein != "")
    { return "ok"; }

    if (timeout != "" && timein == "") {
        return "Enter start time.";
    }

    var dTimeIn = new Date("1/1/00 " + timein);
    var dTimeOut = new Date("1/1/00 " + timeout);

    if (dTimeIn > dTimeOut) {
        dTimeOut.setDate(dTimeIn.getUTCDate() + 1);
    }

    if (billtype == "") {
        billtype = 1    //default to flat rate
    }

    var timelapse = (dTimeOut.getTime() - dTimeIn.getTime()) / 1000 / 60 / 60;
    //return Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    if (timelapse < 0) {
        return "Start time and End time are not properly entered.";
    }

    if (expectedHoursWork == "") { expectedHoursWork = 0; }

    if (expectedHoursWork == 0) {
        expectedHoursWork = 1;
    }
    else if (expectedHoursWork == 1) {
        expectedHoursWork = 1.75;
    }

    if (timelapse >= 16) {
        return "Too much work hours entered.";
    }

    if (billtype == 2)//if hourly
    {
        if (timelapse > 16) {
            return "Start time and end time are not properly entered.";
        }

        if (timelapse > expectedHoursWork && comment == "") {//too much work hour without comment
            return "Please tell us why it's taking longer than expected.";
        }
        if (timelapse > expectedHoursWork && comment != "") {//too much work hour without comment
            return "ok";
        }
        else if (timelapse < expectedHoursWork) {
            return "ok";
        }
    }


    if (dTimeIn < dTimeOut) {
        return "ok";
    }
}

//$("#inlinecalendar")
function calendarStatus(calendarname, enabled) {
    if (enabled) {
        $('#' + calendarname).show();
        $('#' + calendarname).css('backgroundColor', '#ffffff');
        $('#' + calendarname).removeAttr('readOnly');
        $('#' + calendarname).val('');
        $('#' + calendarname).datepicker('enable');
        $('#' + calendarname).removeAttr('disabled');
        $('#inlinecalendarhost').show();
    }
    else {
        $('#' + calendarname).hide();
        $('#' + calendarname).css('backgroundColor', '#eeeeee');
        $('#' + calendarname).attr('readonly', 'readonly');
        $('#' + calendarname).val('Not applicable!');
        $('#' + calendarname).datepicker('disable');
        $('#' + calendarname).attr('disabled', true);
        $('#inlinecalendarhost').hide();
    }
}

/*
==========================================
---------End Calendar Functions-----------
==========================================
*/


// Takes a 1-digit number and inserts a zero before it
function padNumber(number) {
    var ret = new String(number);
    if (ret.length == 1)
        ret = "0" + ret;
    return ret;
}
Array.prototype.remove = function (from, to) {
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};
function getSchedulesByJobnum(jobnum) {

    $.ajax({
        async: true,
        type: "POST",
        url: "forceoneData.asmx/GetSchedulesByJobnum",
        beforeSend: function () {
            $('#tblApproval > tbody').empty();
            $("#divTaskApproval").css({ "display": "block" });
            $("#divLoader").css({ "display": "block" });
            $("#divapprovestatus").css({ "display": "block" });
        },
        data: "{jobnum: " + jobnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populateTasksForApproval(data);
            $("#divLoader").css({ "display": "none" });
            $("#divapprovestatus").css({ "display": "none" });

        },
        error: AjaxFailed
    });       //end ajax
}
function GetSchedulesByJobnumWithSort(jobnum) {

    $.ajax({
        async: true,
        type: "POST",
        url: "forceoneData.asmx/GetSchedulesByJobnumWithSort",
        beforeSend: function () {
            $('#tblApproval > tbody').empty();
            $("#divTaskApproval").css({ "display": "block" });
            $("#divLoader").css({ "display": "block" });
            $("#divapprovestatus").css({ "display": "block" });
        },
        data: "{jobnum: " + jobnum + ", sortcolumn: " + storeschedulecolumnsorted + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populateTasksForApproval(data);
            $("#divLoader").css({ "display": "none" });
            $("#divapprovestatus").css({ "display": "none" });

        },
        error: AjaxFailed
    });
}
function populateTasksForApproval(data) {

    var d = data.d;
    var s = "";
    /*
    <th></th>
    <th>Store</th>
    <th>Date</th>
    <th>Expected Time In</th>
    <th>Time In</th>
    <th>Time Out</th>
    <th>Approve</th>
    */

    //$('#schedulerow_' + d.toString()).remove();
    $('#tblApproval > tbody').empty();

    jQuery.each(d, function () {
        $("#approve_header").text(this.jobdesc.toString().replace(/(\'|\")/gm, '`'));
        s = "";
        s += '<tr id="schedulerow_' + this.idx.toString() + '">';


        var iexpectedhourswork = 0;
        var sexpectedhourswork = "";

        if (this.billtype == 2)//hourly
        {
            if (this.expectedworkhours == 0) {
                iexpectedworkhours = 1;
                sexpectedworkhours = "Less than an hour";
            }
            else if (this.expectedworkhours == 1) {
                iexpectedworkhours = 1.75;
                sexpectedworkhours = "An hour or so";
            }
            else {
                iexpectedworkhours = this.expectedworkhours;
                sexpectedworkhours = this.expectedworkhours + " Hours";
            }
        }
        else {
            iexpectedworkhours = this.totalexpectedhourswork;
            var xx = (this.totalexpectedhourswork).toFixed(2).split(".");
            var h = "0";
            var m = "0";

            if (xx.length > 0) {
                h = xx[0];
                m = Math.round((parseFloat("." + (xx[1])) * 60));
            }
            else {
                h = xx[0];
                m = 0;
            }
            sexpectedworkhours = "<br />Hours:" + h + "<br />Minutes: " + m;
        }

        //sorttable_customkey
        //s += '  <td id="IDx"><input type="hidden" id="approval_IDx_' + this.idx.toString() + '" value = ' + this.idx.toString() + ' />' + this.idx.toString() + '</td>';
        s += '  <td style="width:80px;" id="approval_storename"><span style="color:Green;">' + this.storename + ' (' + this.storenumber.toString() + ')</span></td>';
        s += '  <td style="width:70px;" id="approval_storename"><span style="color:Green;">' + this.employeefirstname + ' ' + this.employeelastname + ' (' + this.repnum + ')</span></td>';
        s += '  <td id="approval_date">' + formatjsondateMMDDYYYY(this.dateschedule) + '<br />Expected Work: ' + sexpectedworkhours + '</td>';
        s += '  <td id="approval_expectedtimein">' + this.expectedtimein + '</td>';
        s += '  <td id="approval_timein">' + returnHHMM(this.timein) + '</td>';
        s += '  <td id="approval_timeout">' + returnHHMM(this.timeout) + '</td>';

        var dTimeIn = new Date(Date.parse(formatjsondateMMDDYYYY(this.timein) + " " + returnHHMM(this.timein)));
        var dTimeOut = new Date(Date.parse(formatjsondateMMDDYYYY(this.timeout) + " " + returnHHMM(this.timeout)));

        if (dTimeIn > dTimeOut) {
            dTimeOut.setDate(dTimeOut.getDate() + 1);
        }

        var timelapse = dTimeOut.getTime() - dTimeIn.getTime();
        var daysDifference = Math.floor(timelapse / 1000 / 60 / 60 / 24);
        timelapse -= daysDifference * 1000 * 60 * 60 * 24

        var hoursDifference = Math.floor(timelapse / 1000 / 60 / 60);
        timelapse -= hoursDifference * 1000 * 60 * 60

        var minutesDifference = Math.floor(timelapse / 1000 / 60);
        timelapse -= minutesDifference * 1000 * 60

        var commentval = '';

        var _comment = this.comment;
        _comment = _comment.replace(/(\'|\")/gm, "`");

        commentval = 'Rep comment: ' + _comment;

        var _managernote = this.managernote;
        _managernote = _managernote.replace(/(\'|\")/gm, "`");

        commentval += '<hr /><input type ="button" class="btn editicon" onclick="updatemanagernote(' + this.idx + ', ' + '\'' + _managernote + '\'); return false;" /><span style="color:blue">Manager note (viewable by rep): <br /><div id="divManagerComment' + this.idx + '">' + _managernote + '</div></span>';

        var _adminnote = this.adminnote;
        _adminnote = _adminnote.replace(/(\'|\")/gm, "`");

        commentval += '<hr /><input type ="button" class="btn editicon" onclick="updateadminnote(' + this.idx + ', ' + '\'' + _adminnote + '\'); return false;" /><span style="color:red">Admin note (viewable by managers): <br /><div id="divAdminComment' + this.idx + '">' + _adminnote + '</div></span>';

        if (commentval == null) { commentval == ""; }

        s += '  <td style="min-width:80px;" id="approval_totalworkhours">Day(s): 0<br />Hour(s): ' + hoursDifference.toString() + '<br />Minute(s): ' + minutesDifference;

        if (this.totaleligblepay > 250 || this.totaleligblepay == 0) {

            if (this.mileagetype == 1) { //per mile
                s += ' <br /><br /><span style="color:Red;">Total eligible pay: $' + Math.round((this.totaleligblepay * 100) / 100).toFixed(2) + '<br />w/ ' + this.mileage + ' ml @ $' + this.mileagepayablerate + '/ml</span></td>';
            }
            else if (this.mileagetype == 2) { //flat rate
                s += ' <br /><br /><span style="color:Red;">Total eligible pay: $' + Math.round((this.totaleligblepay * 100) / 100).toFixed(2) + '<br />w/ $' + this.mileagepayablerate + ' flat rate</span></td>';
            }
            else {
                s += ' <br /><br /><span style="color:Red;">Total eligible pay: $' + Math.round((this.totaleligblepay * 100) / 100).toFixed(2) + '</span></td>';
            }

        }
        else {

            if (this.mileagetype == 1) { //per mile
                s += ' <br /><br />Total eligible pay: $' + Math.round((this.totaleligblepay * 100) / 100).toFixed(2) + '<br />w/ ' + this.mileage + ' ml @ $' + this.mileagepayablerate + '/ml</td>';
            }
            else if (this.mileagetype == 2) { //flat rate
                s += ' <br /><br />Total eligible pay: $' + Math.round((this.totaleligblepay * 100) / 100).toFixed(2) + '<br />w/ $' + this.mileagepayablerate + ' flat rate</td>';
            }
            else {
                s += ' <br /><br />Total eligible pay: $' + Math.round((this.totaleligblepay * 100) / 100).toFixed(2) + '</td>';
            }
        }

        s += '  <td style="min-width:100px; max-width:100px;" id="approval_comments">' + commentval + '</td>';

        s += '  <td style="min-width:70px;">Required: ' + (this.surveyv == true ? 'Y' : 'N') + '<br />';

        var surveyok;

        if (this.surveyv == true) {
            if (this.countofanswers == 0) {
                s += '<span style="color:Red;">Answered: N</span><br />';
                surveyok = false;
            }
            else {
                s += 'Answered: ';
                if (this.countofquestions > this.countofanswers) {
                    s += '<span style="color:Red;">Incomplete<br />';
                    s += this.countofanswers.toString() + '/' + this.countofquestions.toString() + '</span>';
                    surveyok = false;
                }
                else if (this.countofquestions <= this.countofanswers) {
                    s += '<a id="alinkSchedule_' + this.idx + '" href="javascript:;" onclick="getSurveyGroup(' + this.jobnum + ', ' + this.idx + ',0,\'\'); $(\'#divAnswerSurvey\').css({\'display\' : \'block\'});">Complete</a>';
                    surveyok = true;
                }
            }
        }
        else {
            surveyok = true;
        }

        s += '  </td>';

        var icomp = 0;
        var compl = "";

        var allowapprove = "disabled";

        if (returnHHMM(this.timeout) != "" && returnHHMM(this.timein) != "") {
            allowapprove = "";
        }

        if (this.complete == true) { compl = "checked"; }
        if (this.complete == true) { icomp = 1; } else { icomp = 0; }

        //flag if work hours is more than the expected work hours - (hourly) and has no comments
        if (iexpectedworkhours * 60 < (hoursDifference * 60) + minutesDifference && this.comment == "" && this.billtype == 2) {//hourly
            s += '<td sorttable_customkey="' + icomp.toString() + 'Over Limit-No Comment' + this.employeefirstname + this.employeelastname + '" id="approval_approve"><span style="color:Red;">Over Limit/No Comment</span><br />';
            s += '<input type="checkbox" ' + allowapprove + ' onclick="setApproval(this, ' + this.jobnum + ',' + (iexpectedworkhours * 60) + ',' + (parseFloat(hoursDifference * 60) + parseFloat(minutesDifference)) + ',2,' + this.mileagetype.ToString() + ')" title = "Approve" id = "' + this.idx.toString() + '" ' + compl + ' />';
            s += '</td>';
        }
            //flag if work hours is more than the expected work hours - (hourly) but has comment
        else if (iexpectedworkhours * 60 < (hoursDifference * 60) + minutesDifference && this.comment != "" && this.billtype == 2) {//hourly
            s += '<td sorttable_customkey="' + icomp.toString() + 'Over Limit' + this.employeefirstname + this.employeelastname + '" id="approval_approve"><span style="color:Red;">Over Limit</span><br />';
            s += '<input type="checkbox" ' + allowapprove + ' onclick="setApproval(this, ' + this.jobnum + ',' + (iexpectedworkhours * 60) + ',' + (parseFloat(hoursDifference * 60) + parseFloat(minutesDifference)) + ',2,' + this.mileagetype.ToString() + ')" title = "Approve" id = "' + this.idx.toString() + '" ' + compl + ' />';
            s += '</td>';
        }
            //flag if work hours is less than the expected work hours - (flat rate) but has comment
            //(EWH-WH)/EWH
        else if (
            ((iexpectedworkhours * 60) - ((hoursDifference * 60) + minutesDifference)) / ((hoursDifference * 60) + minutesDifference) >= .35 && this.billtype == 1) {//flat rate
            s += '<td sorttable_customkey="' + icomp.toString() + 'Over Limit' + this.employeefirstname + this.employeelastname + '" id="approval_approve"><span style="color:Red;">May be incomplete!<br />Insufficient time to complete.</span><br />';
            s += '<input type="checkbox" ' + allowapprove + ' onclick="setApproval(this, ' + this.jobnum + ',' + (iexpectedworkhours * 60) + ',' + (parseFloat(hoursDifference * 60) + parseFloat(minutesDifference)) + ',2,' + this.mileagetype.ToString() + ')" title = "Approve" id = "' + this.idx.toString() + '" ' + compl + ' />';
            s += '</td>';
        }
        else {
            s += '  <td sorttable_customkey="' + icomp.toString() + 'xxxxxx' + this.employeefirstname + this.employeelastname + '" id="approval_approve"><input type="checkbox" ' + allowapprove + ' onclick="setApproval(this, ' + this.jobnum + ',' + (iexpectedworkhours * 60) + ',' + (parseFloat(hoursDifference * 60) + parseFloat(minutesDifference)) + ',1)" title = "Approve" id = "' + this.idx.toString() + '" ' + compl + ' /></td>';
        }

        s += '</tr>';
        $('#tblApproval > tbody:last').append(s);
    });
    //$("#" + $("#inputradbutton").val() + " [value=" + data.surveyv.toString() + "]").attr("checked", "true");</td>';

}
function setApproval(chk, jobnum, idx, expectedhours, workhours, billtype, mileagetype) {
    //warn if flat rate and the hours work is greater than expected
    var val = $(chk).is(':checked')

    if (billtype == 1 && Math.round((expectedhours / 60), 2) < Math.round((workhours / 60), 2) && val == true) {
        $.msgbox("This is a flat rate job. The actual work hours is greater than the expected work hours. The rep will only be paid for " + Math.round((expectedhours / 60), 3) + " hour(s) instead of " + (parseFloat(workhours) / 60.00).toFixed(2) + " hour(s).<br /><br />If you would like to pay the rep the exact hours worked, please notify payroll.<br /><br />Would you like to continue?", {
            type: "confirm",
            buttons: [
                { type: "submit", value: "Yes" },
                { type: "cancel", value: "Cancel" }
            ]
        },
            function (result) {
                if (result) {
                    approvetimeinout(chk, jobnum, idx, billtype, mileagetype);
                    return true;
                }
                else {
                    $(chk).prop('checked', false);
                    return false;
                } //end if
            } //end function result
        ); //end msgbox confirm
    } //if
    else {
        approvetimeinout(chk, jobnum, idx, billtype, mileagetype);
        return true;
    }
}
function approvetimeinout(chk, jobnum, idx, billtype, mileagetype) {
    var val = $(chk).is(':checked')

    /*
        billtype:
            1 Flat Rate
            2 Hourly

        mileage type:
            1 Per Mile
            2 Flat Rate
            3 No mileage required
    */
    $.ajax({
        async: true,
        type: "POST",
        url: "forceoneData.asmx/CompleteSchedule",
        data: "{idx: " + idx + ", complete: " + val + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.d == 0) {
                $.msgbox("You cannot revert the task approval because it's already invoiced.", {
                    type: "info", buttons: [{ type: "submit", value: "Ok" }]
                });
                $(chk).attr('checked', 'checked');
            }
            else {
                if (val == 1) {
                    $('.approvalEdit_' + idx.toString()).prop('disabled', 'disabled');
                }
                else {
                    $('.approvalEdit_' + idx.toString()).removeAttr('disabled');

                    //keep disabling the mileage input boxes if mileage is not required
                    $('.approvalEdit_' + idx.toString() + '[mileagetype=0]').prop('disabled', 'disabled');

                    //keep disabling the Expected Work Hours input box if it is hourly
                    $('.approvalEdit_' + idx.toString() + '[billtype=2]').prop('disabled', 'disabled');
                }
            }

            //repopulateJobInfo(jobnum);
        },
        error: AjaxFailed
    });          //end ajax
}
/*
this function is called from the delete link of the schedule table row
this function will delete the schedule from the database - for existing schedule
after deleting, it will remove the row from the table

parameters:
idx: this will not be zero if it's an existing schedule - zero if new
date: the schedule date

*/
function deleteschedule(idx, date) {
    if (idx != 0) {
        $.msgbox("Are you sure you want to delete this schedule?", {
            type: "confirm",
            buttons: [
                { type: "submit", value: "Yes" },
                { type: "cancel", value: "Cancel" }
            ]
        },
            function (result) {
                if (result) {
                    $.ajax({
                        async: false,
                        type: "POST",
                        url: "forceoneData.asmx/DeleteSchedule",
                        data: "{idx: " + idx.toString() + "}",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        success: function (data) {
                            if (ismobile) {
                                repopulateDateLabelsStoreSchedule($("#scheduler_idfJobStoresAssigned").val());
                            }
                            else {
                                $('#postStoresByJobnumIDX_' + idx.toString()).remove();//remove the row from the table
                            }
                            removeScheduleRow(data, idx);
                        },
                        error: AjaxFailed
                    });      //end ajax
                }   //end if
            }   //end function
        );    // end msgbox
    } //valid idx
    else {
        removeScheduleRow(date, idx);
    }
}
/*
remove the row from the scheduler
parameters:
data: data will contain the return value after the delete occures
if this particular row schedule is not saved yet, pass the date of the row
idx: the id from the database
*/
function removeScheduleRow(data, idx) {
    var d = data.d;
    if (d) {
        $('#schedulerow_' + idx.toString()).remove();
    }
    else {
        var r = data.replace(/-|\//g, "");
        $('#schedulerow_' + r.toString()).remove();
    }

    //after deleting the row, let's refresh the calendar
    dates.length = 0;

    $('#tblListOfSchedules > tbody > tr').each(function () {
        var dt = $(this).children('td').eq(0).html();
        addDate(dt);
    });

    //--finish refreshing calendar
    if (dates.length) {
        $("#inlinecalendar").multiDatesPicker("resetDates");        //reset calendar
        $("#inlinecalendar").multiDatesPicker('addDates', dates);   //set multiple dates
    }

    //repopulateJobInfo(currentjobnum);

}
function openUpdateTask(dt, idfJobStoresAssigned) {
    alert(idfJobStoresAssigned);
}
function repopulateDateLabelsStoreSchedule(idfJobStoresAssigned) {
    var jobnum = 0;
    jobnum = currentjobnum;
    if (jobnum <= 0) { return alert("Error populating shifts. Please reload by clicking on the Job accordion."); }
    var startdate;
    var enddate;
    if (($("#txtSearchByStartDate").attr("value") != null) && ($("#txtSearchByStartDate").attr("value") != "")) {
        startdate = $("#txtSearchByStartDate").attr("value");
    }
    else {
        startdate = "1/1/2000";
    }

    if (($("#txtSearchByEndDate").attr("value") != null) && ($("#txtSearchByEndDate").attr("value") != "")) {
        enddate = $("#txtSearchByEndDate").attr("value") + " 11:59:59";
    }
    else {
        enddate = "12/31/2100";
    }

    var url = "";
    var params = "";

    url = "forceoneData.asmx/GetStoresByJobNum";
    params = "{JobNum: '" + jobnum + "', StartDate: '" + startdate + "', EndDate: '" + enddate + "'}";

    $.ajax({
        type: "POST",
        url: url,
        data: params,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            postStoresByJobnumMobile(data, jobnum);
        },
        error: AjaxFailed
    });
}
function postDataLabelStoreSchedule(data, idfJobStoresAssigned) {
    var d = data.d;

    if (d == "|" || d == "") {
        $('#warningstore_idfJobStoresAssigned_' + idfJobStoresAssigned).css("visibility", "visible");
        $('#storescheduleinfo_idfJobStoresAssigned_' + idfJobStoresAssigned).css("visibility", "hidden");
    }
    else {
        $('#warningstore_idfJobStoresAssigned_' + idfJobStoresAssigned).css("visibility", "hidden");
        $('#storescheduleinfo_idfJobStoresAssigned_' + idfJobStoresAssigned).css("visibility", "visible");
        var dts = makeschedulelabels(idfJobStoresAssigned, d);
        $('#storescheduleinfo_idfJobStoresAssigned_' + idfJobStoresAssigned).html(dts);
    }
}
//This function returns the date capsule with color codes.
//Complete date is Green
//Partial date - meaning: 2 dates  -> 1 is complete 1 is not
//Else:
function makeschedulelabels(idfjobstoresassigned, schedules) {
    if (schedules == null) { return; }

    var scheds = schedules.replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').replace(',', '').split("^");

    var dts = "";

    for (var i = 0; i <= scheds.length - 1; i++) {
        if (scheds[i] != "") {

            var info = scheds[i].split("|");
            /*
            0 - DateSchedule
			1 - RepName
			2 - RepNum
			3 - EmployeeType
			4 - idfJobStoreAssigned
			5 - IDx
            6 - isAuto (Y,N)
            7 - isNotified (Y,N)
            8 - NotificationResponse (A - accepted, R- Rejected)
            9 - Expected Start Time
            10- status
            */
            var dt = info[0]; //date
            var nm = info[1]; //name
            var rn = info[2]; //repnum
            var tp = info[3]; //emp type
            var idf = info[4];
            var idx = info[5];
            var isAuto = info[6];
            var isNotified = info[7];
            var notificationresponse = info[8];
            var starttime = info[9];
            var status = info[10];

            var backgroundcolor;
            dt = dt.replace(',', '') + " " + starttime;

            var taskacceptoption;
            taskacceptoption = '';

            if (status == "Complete") { backgroundcolor = "Green"; } else if (status == "NOT AFP") { backgroundcolor = "#2E64FE"; } else if (status == "Started") { backgroundcolor = "#FE642E" } else { backgroundcolor = "#848484"; }
            if (nm) {
                if (nm.indexOf("Unassigned") != -1) {
                    backgroundcolor = "Red";
                }
            }
            if (isNotified == 'Y' && notificationresponse != 'A' && notificationresponse != 'R') {
                taskacceptoption = '<div id="divNotificationResponse"><br /><br /><button type="button" style="color:green; font-size:1em;background-color:black" href="javascript:void(0)" onclick="tasknotificationresponse(' + rn.toString() + ',' + idx.toString() + ',1)">Accept</button>&nbsp;&nbsp;<button type="button" style="color:red; font-size:1em;background-color:black" href="javascript:void(0)" onclick="tasknotificationresponse(' + rn.toString() + ',' + idx.toString() + ',0)">Decline</button></div>';
            }
            var alink = "";
            if (status == "Complete") {
                alink = dt + '<br />' + nm + ' - ' + rn + '(' + tp + ')' + '<br />' + status;
            }
            else {
                if (ismobile == true || yilesed == false || teamlead == false) {//merchandiser or mobile users
                    if (notificationresponse == 'A')
                    {
                        alink = '<a style="color:white; font-size:1em;" href=\'task.aspx?idx=' + idx + '&date=' + dt + '\' value="' + dt + '">' + dt + "<br />" + nm + '<br />' + status + '</a>'; // '<input type="button" onclick="location.href=\'task.aspx?idf=' + idfjobstoresassigned + '&date=' + a[0] + '\'" value="' + a[0] + '" />'; //  '<a style="color:white; font-size:1.5em;" onclick="EnterTimeIn(' + idfjobstoresassigned + ',\'' + a[0] + '\')" data-toggle="modal" href="#divScheduler">' + a[0] + '</a>';
                    }
                    else {
                        alink = '<a style="color:white; font-size:1em;" value="' + dt + '">' + dt + "<br />" + nm + '<br />' + status + '</a>'; // '<input type="button" onclick="location.href=\'task.aspx?idf=' + idfjobstoresassigned + '&date=' + a[0] + '\'" value="' + a[0] + '" />'; //  '<a style="color:white; font-size:1.5em;" onclick="EnterTimeIn(' + idfjobstoresassigned + ',\'' + a[0] + '\')" data-toggle="modal" href="#divScheduler">' + a[0] + '</a>';
                        alink = alink + taskacceptoption;
                    }
                }
                else {
                    if (!isclient) {
                        alink = '<a style="color:white; font-size:1em;" onclick="EnterTimeInByIDx(' + idx + ')" data-toggle="modal" href="#divScheduler">' + dt + '<br />' + nm + ' - ' + rn + '(' + tp + ')' + '<br />' + status + '</a>'; // '<a style="color:white; min-height:30px;" href="task.aspx?idf=' + idfjobstoresassigned + '&date=' + a[0] + '">' + a[0] + '</a>';
                    }
                }
            }
            dts += '  <center><div class="clear" /><div style="margin:3px; width:170px;font-size:medium"><span class="badge badge-dark-blue" style="visibility:show; width:170px; background-color:' + backgroundcolor + ';">' + alink + '</span></div></center>';
        }
    }
    return dts;
}
//this function is consumed by makeschedulelabels
function tasknotificationresponse(repnum, idx, response) {
    var par;
    par = '{RepNum: ' + repnum.toString() + ', IDx: ' + idx.toString() + ', Response: ' + response.toString() + '}';

    if (response == 0) { // reject
        reject(par, idx);
    }
    else if (response == 1) { // accept
        accept(par, idx);
    }

    //return false;
}

function accept(par, idx) {
   // if (confirm("Do you agree to the terms and conditions?")) {
        $.ajax({
            async: false,
            type: "POST",
            url: "forceoneData.asmx/TaskNotificationResponse",
            beforeSend: function () {
                $("#divLoader").css({ "display": "block" });
            },
            data: par,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                //$.msgbox("Thank you for accepting the job!", { type: "submit", buttons: [{ type: "submit", value: "OK" }] });
                $("#divNotificationResponse").css({ "display": "none" });
                $("#divLoader").css({ "display": "none" });
                window.location.href = 'task.aspx?idx=' + idx;
            },
            error: AjaxFailed
        }); //ajax addjobstoreschedule
    //}
}

function reject(par) {
    if (confirm("Are you sure you want to reject the shift?")) {
        $.ajax({
            async: false,
            type: "POST",
            url: "forceoneData.asmx/TaskNotificationResponse",
            beforeSend: function () {
                $("#divLoader").css({ "display": "block" });
            },
            data: par,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                $.msgbox("Thank you for letting us know.", { type: "submit", buttons: [{ type: "submit", value: "OK" }] });
                $("#divNotificationResponse").css({ "display": "none" });
                $("#divLoader").css({ "display": "none" });
            },
            error: AjaxFailed
        }); //ajax addjobstoreschedule
    }
}

function RefreshTable(jobnum) {
    var tblID = "#storesbyjobnum_" + jobnum.toString()
    $(tblID).load("jobentry.aspx " + tblID);
}


function getCirqueInfo(jobnum) {
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetOpenJobsByJobNum",
        data: "{jobnum: " + jobnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            // build string and push it to div
        },
        error: AjaxFailed
    }); //ajax addjobstoreschedule
}
//update the job info header (accordion)
function repopulateJobInfo(jobnum) {
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetOpenJobsByJobNum",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{JobNum:" + jobnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var d = data.d;

            $("#" + jobnum).append(c);
            $('#spanJobID_StoreCount_' + jobnum).text(d.storecount);
            $('#spanJobID_CountOfStoresNoSchedule_' + jobnum).text(d.CountOfStoresNoSchedule);
            $('#spanJobID_TotalCountOfSchedules_' + jobnum).text(d.TotalCountOfSchedules);
            $('#jobinfo_remainingtask_' + currentjobnum).text("(" + (d.TotalCountOfSchedules - d.Completed).toString() + ")");
            $('#jobinfo_TotalCountOfSchedules_' + jobnum).text(d.TotalCountOfSchedules);

            $('#jobinfo_completed_' + jobnum).html(d.Completed);
            $('#jobinfo_pctComplete_' + jobnum).text((Math.round(d.pctComplete * 100, 2)).toString() + "%");

            $('#divcirque_' + jobnum).cirque({
                value: (Math.round(d.pctComplete * 100, 2))
            });

            $('#divcirque_' + jobnum).attr("data-value", (Math.round(d.pctComplete * 100, 2)));
            $('#divcirque_' + jobnum + ' > div').html((Math.round(d.pctComplete * 100, 2)).toString() + "%");

            //set warning visible to false
            $('#warning_jobnum_' + jobnum).css("visibility", "hidden");
            $('#spanJobID_CountOfStoresNoSchedule_' + jobnum).css("color", "white");
            $('#spanJobID_JobRequiresAttention_' + jobnum).css("visibility", "hidden");

            if (d.CountOfStoresNoSchedule > 0) {
                $('#warning_jobnum_' + jobnum).css("visibility", "visible");
                $('#spanJobID_CountOfStoresNoSchedule_' + jobnum).css("color", "red");
            }

            if (d.BillType == 0 || d.ClientNum == 0 || d.JobTypeNum == 0 || d.AcctExecNum == 0 || d.BillRate == 0) {
                $('#warning_jobnum_' + jobnum).css("visibility", "visible");
                $('#spanJobID_JobRequiresAttention_' + jobnum).css("visibility", "visible");
            }
            $("#divLoader").css({ "display": "none" });
        },
        error: AjaxFailed
    });
}

/*
this function loops through the table of schedules and try to pass it to the database
for each row:
get the date
get the rep from the <select>
get the idx: this field is not zero if coming from the database
this will be zero if just added from the calendar click event

if idx is zero - it will be an add
if idx <> zero - it will update the database

20170729 - add code to split a task
*/
function commitSchedules() {
    if ($("#scheduler_idfJobStoresAssigned").val() != "") {
        var i = 0;
        var x = 0;
        var err = 0;
        var rows = 0;
        var rowsupdated = 0;
        var payrate = 0;

        //Split
        if ($("#scheduler_issplit").val() == "true") {
            $.when(
                $('#tblListOfSchedules > tbody > tr').each(function () {
                    var currentRow = this;
                    var dt = $(this).children('td').eq(0).html();
                    var repnum = $(this).children('td').eq(1).find('input').val();
                    var repname = $(this).children('td').eq(1).find('option').filter(':selected').text();
                    var idx = $(this).children('td').eq(2).find('input').val();

                    var complete = ($("#hcomplete_idx_" + idx).val());

                    if (!complete || complete !== null || complete !== undefined) {
                        var s = "";
                        if (idx == undefined) { idx = 0; }
                        //if (idx == "0") { s =  dt.replace(/\//g, ''); } else { s = idx; }
                        if (idx == "0") { s = currentRow.id.substring(12, 50); } else { s = idx; }

                        var hrs = getExpectedWorkHours(idx);

                        $("#schedulerdiv_err_" + s).html("");
                         var ret = validateTime2("scheduler_timein_" + s, "scheduler_timeout_" + s, hrs, "scheduler_comment_" + s, "hidbilltype_" + s);
                        if (ret != "ok") {
                            err = 1;
                            $("#schedulerdiv_err_" + s).html('<span style="color:Red;">' + ret + '</span>');
                            jQuery('html, body').animate({ scrollTop: $("#schedule" + s) }, 'slow');
                            $.msgbox(ret, { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                            return false;
                        }

                        if ($("#scheduler_expectedtimein_" + s).val() == "") {
                            err = 1;
                            $.msgbox("Expected time in is not entered.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                            return false;
                        }
                    }
                })
            ).done(function () {

                //validate the total hours - it should not be over than the orginal hours
                var expectedworkhours = 0;
                var totalexpectedworkhours = 0;

                if (err == 0) {
                    $.when($('#tblListOfSchedules > tbody > tr').each(function () {
                        var currentRow = this;
                        var dt = $(this).children('td').eq(0).html();
                        var repnum = $(this).children('td').eq(1).find('input').val();
                        var repname = $(this).children('td').eq(1).find('option').filter(':selected').text();
                        var idx = $(this).children('td').eq(2).find('input').val();

                        if (idx == undefined) { idx = 0; }
                        if (idx == "0") { idx = currentRow.id.substring(12, 50); }

                        if ($("#scheduler_parentIDx").val() == idx) {
                            totalexpectedworkhours = $("#scheduler_expectedworkhours_" + idx.toString()).val()
                            if (isNaN(totalexpectedworkhours)) {
                                $.msgbox("Expected work hours is not defined.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                return false;
                            }
                        }
                        else {
                            var splithours = $("#scheduler_expectedworkhours_" + idx.toString()).val();
                            if (isNaN(splithours)) {
                                $.msgbox("Expected work hours is not defined.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                return false;
                            }

                            expectedworkhours = parseFloat(expectedworkhours) + parseFloat(splithours);
                        }
                    })).done(function () {

                        if (parseFloat(expectedworkhours) > parseFloat(totalexpectedworkhours)) {
                            $.msgbox("Total expected work hours (" + totalexpectedworkhours + ") is less than the total split hours (" + expectedworkhours + ").", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                            return false;
                        }
                        else {
                            $.when($('#tblListOfSchedules > tbody > tr').each(function () {
                                var currentRow = this;

                                var dt;

                                var idx = $(this).children('td').eq(2).find('input').val();

                                var complete = $("#hcomplete_idx_" + idx).val();

                                if (complete == undefined || complete == 'null') { complete = "false"; }

                                var managernote;
                                var adminnote;

                                if (complete == "false") {
                                    if (idx) {
                                        dt = $("#lnkscheduler_date_idx_" + idx.toString()).text();
                                    }
                                    else {
                                        dt = $(this).children('td').eq(0).html();
                                    }

                                    var repnum = $(this).children('td').eq(1).find('input').val();
                                    var repname = $(this).children('td').eq(1).find('option').filter(':selected').text();

                                    var s = "";
                                    if (idx == undefined) { idx = 0; }
                                    if (idx == "0") { s = currentRow.id.substring(12, 50); } else { s = idx; }
                                    
                                    if ($("#scheduler_parentIDx").val() == idx) {

                                    }
                                    else {
                                        //must have a merchandiser assigned
                                        if (repnum != 0) {
                                            rows++;
                                            var mil = $("#scheduler_mileage_" + s).val();
                                            var miscexpense = 0;
                                            var miscexpensereason = "";
                                            var nmileagetype;
                                            var nmileagepayablerate;
                                            var nmileagebillablerate;

                                            if (mil == "" || mil == null) { mil = 0; }

                                            //int idfJobStoresAssigned, int RepNum, DateTime DateSchedule, int IDx
                                            var xpectedhourswork = -1;

                                            if (yilesed || teamlead) {
                                                xpectedworkhours = $("#scheduler_expectedworkhours_" + s).val();
                                                if (xpectedworkhours == "" || xpectedworkhours == null) {
                                                    xpectedworkhours = -1;
                                                }

                                                payrate = $("#scheduler_payrate_" + s).val();
                                                try {
                                                    if (parseFloat(payrate) == 0) {
                                                        payrate = "";
                                                    }
                                                }
                                                catch (e) { }
                                                miscexpense = $("#scheduler_miscexpense_" + s).val();
                                                miscexpensereason = $("#scheduler_miscexpensereason_" + s).val();

                                            }
                                            else {
                                                payrate = $("#scheduler_payrate_" + s).val();
                                                try {
                                                    if (parseFloat(payrate) == 0) {
                                                        payrate = "";
                                                    }
                                                }
                                                catch (e) { }
                                                miscexpense = $("#hidmiscexpense_" + s).val();
                                                miscexpensereason = $("#hidmiscexpensereason_" + s).val();
                                            }

                                            nmileagetype = $("#scheduler_mileagetype_" + s).val();
                                            nmileagebillablerate = $("#scheduler_mileagebillablerate_" + s).val();
                                            nmileagepayablerate = $("#scheduler_mileagepayablerate_" + s).val();
                                            managernote = $("#scheduler_managernote_" + s).val();
                                            adminnote = $("#scheduler_adminnote_" + s).val();

                                            var cancel = false;

                                            if (payrate == "" || payrate == null || isNaN(payrate)) {
                                                $.msgbox("Payrate is not a valid number for " + repname + ".", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                                cancel = true;
                                            }
                                            
                                            if (nmileagebillablerate == "" || nmileagebillablerate == null || isNaN(nmileagebillablerate)) {
                                                $.msgbox("Mileage bill rate is not a valid number for " + repname + ".", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                                cancel = true;
                                            }

                                            if (nmileagepayablerate == "" || nmileagepayablerate == null || isNaN(nmileagepayablerate)) {
                                                $.msgbox("Mileage payroll rate is not a valid number for " + repname + ".", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                                cancel = true;
                                            }

                                            if (!cancel) {
                                                var newtimein = "";
                                                var newtimeout = "";

                                                var today = new Date();
                                                var dd = today.getDate();
                                                var mm = today.getMonth() + 1; //January is 0!
                                                var yyyy = today.getFullYear();

                                                if ($("#scheduler_timein_" + s).val() != "") {
                                                    newtimein = $("#scheduler_timein_" + s).val();

                                                    var dnewtimein = new Date(mm + "/" + dd + "/" + yyyy + " " + newtimein);

                                                    var offset = -5.0;

                                                    var utcIn = dnewtimein.getTime() + (dnewtimein.getTimezoneOffset() * 60000);
                                                    newtimein = new Date(utcIn + (3600000 * offset));
                                                    newtimein = ("0" + dnewtimein.getHours().toString()).substr(1, 2) + ":" + ("0" + dnewtimein.getMinutes().toString()).substr(1, 2);
                                                }

                                                if ($("#scheduler_timeout_" + s).val() != "") {
                                                    newtimeout = $("#scheduler_timeout_" + s).val();
                                                    var dnewtimeout = new Date(mm + "/" + dd + "/" + yyyy + " " + newtimeout);

                                                    var offset = -5.0;

                                                    var utcOut = dnewtimeout.getTime() + (dnewtimeout.getTimezoneOffset() * 60000);

                                                    newtimeout = new Date(utcOut + (3600000 * offset));
                                                    newtimeout = ("0" + dnewtimeout.getHours().toString()).substr(1, 2) + ":" + ("0" + dnewtimeout.getMinutes().toString()).substr(1, 2);
                                                }

                                                var parentIDx = $("#scheduler_parentIDx").val();

                                                var par = "{idfJobStoresAssigned: " + $("#scheduler_idfJobStoresAssigned").val();
                                                par += ", RepNum: " + repnum;
                                                par += ", DateSchedule: '" + dt + "', ExpectedTimeIn: '" + $("#scheduler_expectedtimein_" + s).val() + "', TimeIn: '" + newtimein;
                                                par += "', TimeOut: '" + newtimeout + "', IDx: " + idx.toString() + ", comment: '" + Base64.encode($("#scheduler_comment_" + s).val());
                                                par += "', mileage: " + mil + ", payrate: " + payrate + ", expectedhourswork: " + xpectedworkhours.toString() + ", miscexpense: " + miscexpense;
                                                par += ", miscexpensereason: '" + Base64.encode(miscexpensereason);
                                                par += "', mileagetype: " + nmileagetype + ", mileagebillablerate: " + nmileagebillablerate.toString();
                                                par += ", mileagepayablerate: " + nmileagepayablerate.toString() + ", managernote: '" + Base64.encode(managernote.toString());
                                                par += "', adminnote: '" + Base64.encode(adminnote.toString());
                                                par += "', parentIDx: " + parentIDx.toString() + "}";

                                                $.ajax({
                                                    async: false,
                                                    type: "POST",
                                                    url: "forceoneData.asmx/AddJobStoreScheduleSplit",
                                                    beforeSend: function () {
                                                        $("#divLoader").css({ "display": "block" });
                                                    },
                                                    data: par,
                                                    contentType: "application/json; charset=utf-8",
                                                    dataType: "json",
                                                    success: function (data) {
                                                        rowsupdated++;
                                                        changeRowShedulerID(currentRow, data);
                                                    },
                                                    error: AjaxFailed
                                                }); //ajax addjobstoreschedule
                                            } //cancel
                                        }
                                        else {
                                            err = 1;
                                            $.msgbox("Please select a merchandiser.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                        } //rep no good
                                    }
                                } //is complete
                            })              //each row
			                ).done(function () {

			                    if (err == 0) {
			                        if (rows == rowsupdated && rowsupdated > 0) {
			                            $.msgbox("Schedules saved!", {
			                                type: "info",
			                                buttons: [{ type: "submit", value: "OK" }],
			                                success: function () {
			                                    repopulateDateLabelsStoreSchedule($("#scheduler_idfJobStoresAssigned").val());
			                                    repopulateJobInfo(currentjobnum);
			                                    //movetodiv("divAccordionGroupHeader" + currentjobnum.toString());
			                                    $.ajax({
			                                        type: "POST",
			                                        url: "forceoneData.asmx/IsMerchandiser",
			                                        data: "",
			                                        contentType: "application/json; charset=utf-8",
			                                        dataType: "json",
			                                        success: function (data) {
			                                            if (data.d == true) {
			                                                $("#alinkSchedule_" + idx).click();
			                                            }
			                                        },
			                                        error: AjaxFailed
			                                    }); //ajax ismerchandiser


			                                }
			                            });
			                            if (!ismobile) {
			                                $.when(GetStoresByJobNum(currentjobnum)).done(function () {
			                                    $('#divscheduler').css({ 'display': 'none' });
			                                });
			                            }
			                        }
			                    }

			                    if (rowsupdated == 0) {
			                        $.msgbox("No schedules have been saved.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
			                    }

			                    $("#divLoader").css({ "display": "none" });

			                    $("#storesbyjobnum_" + currentjobnum.toString()).closest('tr').find('td:eq(4)').click();
			                });

                        }
                    });
                }
                else {
                    $.msgbox("No schedules have been saved.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                }
            });

        }
        else {
            $.when(
                $('#tblListOfSchedules > tbody > tr').each(function () {
                    
                    var currentRow = this;
                   
                    var dt = $(this).children('td').eq(0).html();
                    var repnum = $(this).children('td').eq(1).find('input').val();
                    var repname = $(this).children('td').eq(1).find('option').filter(':selected').text();
                    
                    var idx = $(this).children('td').eq(2).find('input').val();
                    
                    var complete = $("#hcomplete_idx_" + idx).val();

                    if (!complete) {
                        var s = "";
                        if (idx == undefined) { idx = 0; }
                        //if (idx == "0") { s =  dt.replace(/\//g, ''); } else { s = idx; }
                        if (idx == "0") { s = currentRow.id.substring(12, 50); } else { s = idx; }

                        var hrs = getExpectedWorkHours(idx);

                        $("#schedulerdiv_err_" + s).html("");
                        // var ret = validateTime2("scheduler_timein_" + s, "scheduler_timeout_" + s, hrs, "scheduler_comment_" + s, "hidbilltype_" + s);
                        var ret = validateTime2("scheduler_timein_" + s, "scheduler_timeout_" + s, hrs, "scheduler_comment_" + s, "hidbilltype_" + s);

                        if (ret != "ok") {
                            err = 1;
                            $("#schedulerdiv_err_" + s).html('<span style="color:Red;">' + ret + '</span>');
                            jQuery('html, body').animate({ scrollTop: $("#schedule" + s) }, 'slow');
                            $.msgbox(ret, { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                            return false;
                        }

                        if ($("#scheduler_expectedtimein_" + s).val() == "") {
                            err = 1;
                            $.msgbox("Expected time in is not entered.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                            return false;
                        }
                    }
                })

            ).done(function () {
                if (err == 0) {
                    $.when($('#tblListOfSchedules > tbody > tr').each(function () {
                        var currentRow = this;

                        var dt;

                        var idx = $(this).children('td').eq(2).find('input').val();

                        complete = $("#hcomplete_idx_" + idx).val();

                        if (typeof complete == undefined || complete == null || complete == 'null' || complete == 'undefined' || complete == 0) { complete = "false"; }

                        var managernote;
                        var adminnote;

                        if (complete == "false") {
                            if (idx) {
                                dt = $("#lnkscheduler_date_idx_" + idx.toString()).text();
                            }
                            else {
                                dt = $(this).children('td').eq(0).html();
                            }

                            var repnum = $(this).children('td').eq(1).find('input').val();
                            var repname = $(this).children('td').eq(2).find('option').filter(':selected').text();

                            var s = "";
                            if (idx == undefined) { idx = 0; }
                            if (idx == "0") { s = currentRow.id.substring(12, 50); } else { s = idx; }

                            //must have a merchandiser assigned
                            if (repnum != 0) {
                                rows++;
                                var mil = $("#scheduler_mileage_" + s).val();
                                var miscexpense = 0;
                                var miscexpensereason = "";
                                var nmileagetype;
                                var nmileagepayablerate;
                                var nmileagebillablerate;


                                if (mil == "" || mil == null) { mil = 0; }

                                //int idfJobStoresAssigned, int RepNum, DateTime DateSchedule, int IDx
                                var xpectedhourswork = -1;

                                if (yilesed || teamlead) {
                                    xpectedworkhours = $("#scheduler_expectedworkhours_" + s).val();
                                    if (xpectedworkhours == "" || xpectedworkhours == null) {
                                        xpectedworkhours = -1;
                                    }

                                    payrate = $("#scheduler_payrate_" + s).val();
                                    try {
                                        if (parseFloat(payrate) == 0) {
                                            payrate = "";
                                        }
                                    }
                                    catch (e) { }
                                    miscexpense = $("#scheduler_miscexpense_" + s).val();
                                    miscexpensereason = $("#scheduler_miscexpensereason_" + s).val();

                                }
                                else {
                                    payrate = $("#scheduler_payrate_" + s).val();
                                    try {
                                        if (parseFloat(payrate) == 0) {
                                            payrate = "";
                                        }
                                    }
                                    catch (e) { }
                                    miscexpense = $("#hidmiscexpense_" + s).val();
                                    miscexpensereason = $("#hidmiscexpensereason_" + s).val();
                                }

                                nmileagetype = $("#scheduler_mileagetype_" + s).val();
                                nmileagebillablerate = $("#scheduler_mileagebillablerate_" + s).val();
                                nmileagepayablerate = $("#scheduler_mileagepayablerate_" + s).val();
                                managernote = $("#scheduler_managernote_" + s).val();
                                adminnote = $("#scheduler_adminnote_" + s).val();

                                var cancel = false;

                                if (isNaN(payrate)) { //payrate == "" || payrate == null || 
                                    $.msgbox("Payrate is not a valid number for " + repname + ".", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                    cancel = true;
                                }

                                if (isNaN(nmileagebillablerate)) { //nmileagebillablerate == "" || nmileagebillablerate == null || 
                                    $.msgbox("Mileage bill rate is not a valid number for " + repname + ".", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                    cancel = true;
                                }

                                if (isNaN(nmileagepayablerate)) { // nmileagepayablerate == "" || nmileagepayablerate == null || 
                                    $.msgbox("Mileage payroll rate is not a valid number for " + repname + ".", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                                    cancel = true;
                                }


                                if (!cancel) {
                                    var newtimein = "";
                                    var newtimeout = "";

                                    var today = new Date();
                                    var dd = today.getDate();
                                    var mm = today.getMonth() + 1; //January is 0!
                                    var yyyy = today.getFullYear();

                                    if ($("#scheduler_timein_" + s).val() != "") {
                                        newtimein = $("#scheduler_timein_" + s).val();

                                        var dnewtimein = new Date(mm + "/" + dd + "/" + yyyy + " " + newtimein);

                                        var offset = -5.0;

                                        var utcIn = dnewtimein.getTime() + (dnewtimein.getTimezoneOffset() * 60000);
                                        newtimein = new Date(utcIn + (3600000 * offset));
                                        newtimein = ("0" + dnewtimein.getHours().toString()).substr(1, 2) + ":" + ("0" + dnewtimein.getMinutes().toString()).substr(1, 2);
                                    }

                                    if ($("#scheduler_timeout_" + s).val() != "") {
                                        newtimeout = $("#scheduler_timeout_" + s).val();
                                        var dnewtimeout = new Date(mm + "/" + dd + "/" + yyyy + " " + newtimeout);

                                        var offset = -5.0;

                                        var utcOut = dnewtimeout.getTime() + (dnewtimeout.getTimezoneOffset() * 60000);

                                        newtimeout = new Date(utcOut + (3600000 * offset));
                                        newtimeout = ("0" + dnewtimeout.getHours().toString()).substr(1, 2) + ":" + ("0" + dnewtimeout.getMinutes().toString()).substr(1, 2);
                                    }


                                    var par = "{idfJobStoresAssigned: " + $("#scheduler_idfJobStoresAssigned").val() + ", RepNum: " + repnum;
                                    par += ", DateSchedule: '" + dt + "', ExpectedTimeIn: '" + $("#scheduler_expectedtimein_" + s).val() + "', TimeIn: '" + newtimein;
                                    par += "', TimeOut: '" + newtimeout + "', IDx: " + idx.toString() + ", comment: '" + Base64.encode($("#scheduler_comment_" + s).val());
                                    par += "', mileage: " + mil + ", payrate: " + payrate + ", expectedhourswork: " + xpectedworkhours.toString() + ", miscexpense: " + miscexpense;
                                    par += ", miscexpensereason: '" + Base64.encode(miscexpensereason);
                                    par += "', mileagetype: " + nmileagetype + ", mileagebillablerate: " + nmileagebillablerate.toString() + ", mileagepayablerate: " + nmileagepayablerate.toString() + ", managernote: '" + Base64.encode(managernote.toString()) + "', adminnote: '" + Base64.encode(adminnote.toString()) + "'}";
                                    $.ajax({
                                        async: false,
                                        type: "POST",
                                        url: "forceoneData.asmx/AddJobStoreSchedule",
                                        beforeSend: function () {
                                            $("#divLoader").css({ "display": "block" });
                                        },
                                        data: par,
                                        contentType: "application/json; charset=utf-8",
                                        dataType: "json",
                                        success: function (data) {
                                            rowsupdated++;
                                            changeRowShedulerID(currentRow, data);
                                        },
                                        error: AjaxFailed
                                    }); //ajax addjobstoreschedule
                                } //cancel
                            }
                            else {
                                err = 1;
                                $.msgbox("Please select a merchandiser.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                            } //rep no good
                        } //is complete
                    })              //each row
                    ).done(function () {
                        if (err == 0) {
                            if (rows == rowsupdated && rowsupdated > 0) {
                                $.msgbox("Schedules saved!", {
                                    type: "info",
                                    buttons: [{ type: "submit", value: "OK" }],
                                    success: function () {
                                        repopulateDateLabelsStoreSchedule($("#scheduler_idfJobStoresAssigned").val());
                                        repopulateJobInfo(currentjobnum);
                                        //movetodiv("divAccordionGroupHeader" + currentjobnum.toString());
                                        $.ajax({
                                            type: "POST",
                                            url: "forceoneData.asmx/IsMerchandiser",
                                            data: "",
                                            contentType: "application/json; charset=utf-8",
                                            dataType: "json",
                                            success: function (data) {
                                                if (data.d == true) {
                                                    $("#alinkSchedule_" + idx).click();
                                                }
                                            },
                                            error: AjaxFailed
                                        }); //ajax ismerchandiser
                                    }

                                });
                                if (!ismobile) {
                                    $.when(GetStoresByJobNum(currentjobnum)).done(function () {
                                        $('#divscheduler').css({ 'display': 'none' });
                                    });
                                }
                            }
                            else {
                                if (rowsupdated == 0) {
                                    $.msgbox("No schedules have been saved.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                                }
                            }
                        }
                        else {
                            $.msgbox("No record to save.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                        }

                        $("#divLoader").css({ "display": "none" });

                        $("#storesbyjobnum_" + currentjobnum.toString()).closest('tr').find('td:eq(4)').click();
                    });
                }
            });
        }
        
    }
}




function answerSurvey(questionid, typeid, surveyid) {
    var qid = 0;
    if (surveyid > 0)
        qid = surveyid;
    else {
        qid = questionid;
        surveyid = '';
    }

    var idx = $("#hidSurveyAnswerIDx" + qid).val();
    var flag = false;
    var questionnum = 0;
    var ans1 = '';
    var ans2 = '';
    var ans3 = '';
    var ans4 = '';
    var ans5 = '';
    var ans6 = '';
    var ans7 = '';
    var ans8 = '';
    var ans9 = '';
    var ans10 = '';

    var answers = new Array();
    var requiredquestionsnotanswered = 0;
    var mustbeanumber = 0;

    //check if any required questions are not answered:
    $('#QuestionsByJob').each(function () {
        //if (document.getElementById('star')) {
        var required = '*';

        ans1 = '';
        ans2 = '';
        ans3 = '';
        ans4 = '';
        ans5 = '';
        ans6 = '';
        ans7 = '';
        ans8 = '';
        ans9 = '';
        ans10 = '';

        //surveyid = document.getElementById("hidSurveyAnswerSurveyID").value; // ($("td:nth-child(2) input[id$=hidSurveyAnswerSurveyID", this));

        var questionnum;
        questionnum = document.getElementById("hidSurveyOrderNum" + qid).value;
        if (typeid <= 0) { questiontypeid = document.getElementById("hidSurveyAnswerQuestionType" + qid).value; } else { questiontypeid = typeid; }
        if (questiontypeid == 7) {
            qsid = document.getElementById("hidSurveyAnswerQuestionID" + qid).value;
            ans1 = document.getElementById("txtSurveyAnswer_" + qid).value;

            if (isNaN(ans1) && (typeof ans1 != 'number')) {
                alert('not a number: ' + ans1);
                q = $('#divSurveyQuestion_' + qsid).text();
                //document.getElementById("alert").innerHTML = "Please enter numeric values only!";
                //$.msgbox("The answer to this question must be a number: " + q, { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                mustbeanumber = 1;
                ans1 = "";
            }
            else {
                if (parseInt(ans1) < 0 || parseInt(ans1) > 2000) {
                    q = $('#divSurveyQuestion_' + qsid).text();
                    //document.getElementById("alert").innerHTML = "Please enter a number between 0 to 2000!";
                    //$.msgbox("The answer to this question must be between 0 to 2000: " + q, { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                    mustbeanumber = 1;
                }
            }
        }
        else if (questiontypeid == 6) {
            questionnum = document.getElementById("hidSurveyOrderNum" + qid).value;
            ans1 = $("#hidSurveyPhoto_" + qid.toString() + "_" + questionnum.toString()).val();
            if (ans1 == "0") {
                ans1 = "";
                //document.getElementById("alert").innerHTML = "Please upload a photo to continue!";
            }
        }
        else if (questiontypeid == 5) {
            ans1 = document.getElementById("txtSurveyAnswer_" + qid).value;
        }
        else if (questiontypeid == 4) {
            ans1 = document.getElementById("txtSurveyAnswer_" + qid).value;
        }
        else if (questiontypeid == 3) {
            //pick one
            ans1 = document.querySelector('input[name="survey_answers_opt"' + qid + ']:checked').value;
        }
        else if (questiontypeid == 2) {
            //multiple answers
            var i = 0;
            var chks = document.querySelectorAll('input[name="survey_answers_opt' + qid + '"]'); //'input[type = checkbox]:checked' --check all

            $(chks).each(function () {
                i++;
                if ($(this).attr('checked')) {
                    if ($(this).val() != undefined) {
                        switch (i) {
                            case 1:
                                ans1 = $(this).val();
                                break;
                            case 2:
                                ans2 = $(this).val();
                                break;
                            case 3:
                                ans3 = $(this).val();
                                break;
                            case 4:
                                ans4 = $(this).val();
                                break;
                            case 5:
                                ans5 = $(this).val();
                                break;
                            case 6:
                                ans6 = $(this).val();
                                break;
                            case 7:
                                ans7 = $(this).val();
                                break;
                            case 8:
                                ans8 = $(this).val();
                                break;
                            case 9:
                                ans9 = $(this).val();
                                break;
                            case 10:
                                ans10 = $(this).val();
                                break;
                        }
                    }
                }
            });
        }
        else if (questiontypeid == 1) {
            //yes/no
            var a1 = document.querySelectorAll('input[name="survey_answers_opt' + qid + '"]:checked');
            if (a1[0].checked)
                ans1 = a1[0].value;
        }
        if (ans1 == undefined) { ans1 = ""; }
        if (ans2 == undefined) { ans2 = ""; }
        if (ans3 == undefined) { ans3 = ""; }
        if (ans4 == undefined) { ans4 = ""; }
        if (ans5 == undefined) { ans5 = ""; }
        if (ans6 == undefined) { ans6 = ""; }
        if (ans7 == undefined) { ans7 = ""; }
        if (ans8 == undefined) { ans8 = ""; }
        if (ans9 == undefined) { ans9 = ""; }
        if (ans10 == undefined) { ans10 = ""; }

        if (required == "*") {
            if (ans1 + ans2 + ans3 + ans4 + ans5 + ans6 + ans7 + ans8 + ans9 + ans10 == "") {
                requiredquestionsnotanswered++;
            }
        }

        if (mustbeanumber > 0) {
            return false;
        }
        else if (requiredquestionsnotanswered == 1) {
            //document.getElementById("alert").innerHTML = "You must answer the question to proceed!"
            return false;
        }
        else if (requiredquestionsnotanswered > 1) {
            return false;
        }
        var answer = {
            IDx: idx,
            QuestionID: questionid,
            SurveyID: surveyid,
            QuestionNum: questionnum,
            Answer1: ans1,
            Answer2: ans2,
            Answer3: ans3,
            Answer4: ans4,
            Answer5: ans5,
            Answer6: ans6,
            Answer7: ans7,
            Answer8: ans8,
            Answer9: ans9,
            Answer10: ans10
        };

        answers.push(answer);
    });

    var procedure;
    if (surveyid > 0) {
        procedure = "forceoneData.asmx/SaveAnswer";
    }
    else {
        procedure = "forceoneData.asmx/SaveAnswerByQuestionID";
    }

    $.ajax({
        type: "POST",
        async: false,
        url: procedure,
        data: "{Answers:" + JSON.stringify(answers) + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            //$.msgbox("Thank you!<br />Your answers were successfully saved.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
            if (data.d > 0) {
                flag = true;
            }
        },
        error: AjaxFailed
    });

    //window.location = "jobentry.aspx";
    //saveSurveyAnswer( )
    return flag;
}

function checkAnswer(questionid, typeid, surveyid) {

    if (answerSurvey(questionid, typeid, surveyid)) {
        $("#txtSurveyAnswer_" + questionid).css("border-color", "#00FF00");
        $("#txtSurveyAnswer_" + questionid).css("box-shadow", "0 0 0 0.2rem #00FF00");
    }
    else {
        $("#checkboxes").css("border-color", "#ff0000");
        $("#checkboxes").css("box-shadow", "0 0 0 0.2rem #ff0000");
        $(".savesurveyphotos").css("border-color", "#ff0000");
        $(".savesurveyphotos").css("box-shadow", "0 0 0 0.2rem #ff0000");
        $("#txtSurveyAnswer_" + questionid).css("border-color", "#ff0000");
        $("#txtSurveyAnswer_" + questionid).css("box-shadow", "0 0 0 0.2rem #ff0000");
        alert("Error: Wrong Input");
    }
}

function answerSurveyOne(questionid, typeid, surveyid) {
    var qid = 0;
    if (surveyid > 0)
        qid = surveyid;
    else {
        qid = questionid;
        surveyid = '';
    }

    var idx = $("#hidSurveyAnswerIDx").val();
    var flag = false;
    var questionnum = 0;
    var ans1 = '';
    var ans2 = '';
    var ans3 = '';
    var ans4 = '';
    var ans5 = '';
    var ans6 = '';
    var ans7 = '';
    var ans8 = '';
    var ans9 = '';
    var ans10 = '';

    var answers = new Array();
    var requiredquestionsnotanswered = 0;
    var mustbeanumber = 0;

    //check if any required questions are not answered:
    $('#QuestionsByJob').each(function () {
        //if (document.getElementById('star')) {
            var required = '*';

        ans1 = '';
        ans2 = '';
        ans3 = '';
        ans4 = '';
        ans5 = '';
        ans6 = '';
        ans7 = '';
        ans8 = '';
        ans9 = '';
        ans10 = '';

        //surveyid = document.getElementById("hidSurveyAnswerSurveyID").value; // ($("td:nth-child(2) input[id$=hidSurveyAnswerSurveyID", this));

        var questionnum;
        questionnum = document.getElementById("hidSurveyOrderNum").value;
        if (typeid <= 0) { questiontypeid = document.getElementById("hidSurveyAnswerQuestionType").value; } else { questiontypeid = typeid; }
        if (questiontypeid == 7) {
            qsid = document.getElementById("hidSurveyAnswerQuestionID").value;
            ans1 = document.getElementById("txtSurveyAnswer_" + qid).value;

            if (isNaN(ans1) && (typeof ans1 != 'number')) {
                alert('not a number: ' + ans1);
                q = $('#divSurveyQuestion_' + qsid).text();
                //document.getElementById("alert").innerHTML = "Please enter numeric values only!";
                //$.msgbox("The answer to this question must be a number: " + q, { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                mustbeanumber = 1;
                ans1 = "";
            }
            else {
                if (parseInt(ans1) < 0 || parseInt(ans1) > 2000) {
                    q = $('#divSurveyQuestion_' + qsid).text();
                    //document.getElementById("alert").innerHTML = "Please enter a number between 0 to 2000!";
                    //$.msgbox("The answer to this question must be between 0 to 2000: " + q, { type: "error", buttons: [{ type: "submit", value: "OK" }] });
                    mustbeanumber = 1;
                }
            }
        }
        else if (questiontypeid == 6) {
            questionnum = document.getElementById("hidSurveyOrderNum").value;
            ans1 = $("#hidSurveyPhoto_" + qid.toString() + "_" + questionnum.toString()).val();
            if (ans1 == "0") {
                ans1 = "";
                //document.getElementById("alert").innerHTML = "Please upload a photo to continue!";
            }
        }
        else if (questiontypeid == 5) {
            ans1 = document.getElementById("txtSurveyAnswer_" + qid).value;
        }
        else if (questiontypeid == 4) {
            ans1 = document.getElementById("txtSurveyAnswer_" + qid).value;
        }
        else if (questiontypeid == 3) {
            //pick one
            ans1 = document.querySelector('input[name="survey_answers_opt"' + qid + ']:checked').value;
        }
        else if (questiontypeid == 2) {
            //multiple answers
            var i = 0;
            var chks = document.querySelectorAll('input[name="survey_answers_opt' + qid + '"]'); //'input[type = checkbox]:checked' --check all

            $(chks).each(function () {
                i++;
                if ($(this).attr('checked')) {
                    if ($(this).val() != undefined) {
                        switch (i) {
                            case 1:
                                ans1 = $(this).val();
                                break;
                            case 2:
                                ans2 = $(this).val();
                                break;
                            case 3:
                                ans3 = $(this).val();
                                break;
                            case 4:
                                ans4 = $(this).val();
                                break;
                            case 5:
                                ans5 = $(this).val();
                                break;
                            case 6:
                                ans6 = $(this).val();
                                break;
                            case 7:
                                ans7 = $(this).val();
                                break;
                            case 8:
                                ans8 = $(this).val();
                                break;
                            case 9:
                                ans9 = $(this).val();
                                break;
                            case 10:
                                ans10 = $(this).val();
                                break;
                        }
                    }
                }
            });
        }
        else if (questiontypeid == 1) {
            //yes/no
            var a1 = document.querySelectorAll('input[name="survey_answers_opt' + qid + '"]:checked');
            if (a1[0].checked)
                ans1 = a1[0].value;
        }
        if (ans1 == undefined) { ans1 = ""; }
        if (ans2 == undefined) { ans2 = ""; }
        if (ans3 == undefined) { ans3 = ""; }
        if (ans4 == undefined) { ans4 = ""; }
        if (ans5 == undefined) { ans5 = ""; }
        if (ans6 == undefined) { ans6 = ""; }
        if (ans7 == undefined) { ans7 = ""; }
        if (ans8 == undefined) { ans8 = ""; }
        if (ans9 == undefined) { ans9 = ""; }
        if (ans10 == undefined) { ans10 = ""; }

        if (required == "*") {
            if (ans1 + ans2 + ans3 + ans4 + ans5 + ans6 + ans7 + ans8 + ans9 + ans10 == "") {
                requiredquestionsnotanswered++;
            }
        }

    if (mustbeanumber > 0) {
        return false;
    }
    else if (requiredquestionsnotanswered == 1) {
        //document.getElementById("alert").innerHTML = "You must answer the question to proceed!"
        return false;
    }
    else if (requiredquestionsnotanswered > 1) {
        return false;
        }
    var answer = {
                IDx: idx,
                QuestionID: questionid,
                SurveyID: surveyid,
                QuestionNum: questionnum,
                Answer1: ans1,
                Answer2: ans2,
                Answer3: ans3,
                Answer4: ans4,
                Answer5: ans5,
                Answer6: ans6,
                Answer7: ans7,
                Answer8: ans8,
                Answer9: ans9,
                Answer10: ans10
     };
        
     answers.push(answer);
    });

    var procedure;
    if (surveyid > 0) {
        procedure = "forceoneData.asmx/SaveAnswer";
    }
    else {
        procedure = "forceoneData.asmx/SaveAnswerByQuestionID";
    }

    $.ajax({
        type: "POST",
        async: false,
        url: procedure,
        data: "{Answers:" + JSON.stringify(answers) + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            //$.msgbox("Thank you!<br />Your answers were successfully saved.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
            if (data.d > 0) {
                flag = true;
            }
        },
        error: AjaxFailed
    });

    //window.location = "jobentry.aspx";
    //saveSurveyAnswer( )
    return flag;
}
function checkAnswerOne(questionid, typeid, surveyid) {

    if (answerSurveyOne(questionid, typeid, surveyid)) {
        $("#txtSurveyAnswer_" + questionid).css("border-color", "#00FF00");
        $("#txtSurveyAnswer_" + questionid).css("box-shadow", "0 0 0 0.2rem #00FF00");
        $("#Next").prop("disabled", false);
        $("#Submit").prop("disabled", false);
        //document.getElementById("alert").setAttribute('hidden', true);
        //document.getElementById("Next").click();
    }
    else {
        //document.getElementById("alert").removeAttribute('hidden');
        $("#checkboxes").css("border-color", "#ff0000");
        $("#checkboxes").css("box-shadow", "0 0 0 0.2rem #ff0000");
        $(".savesurveyphotos").css("border-color", "#ff0000");
        $(".savesurveyphotos").css("box-shadow", "0 0 0 0.2rem #ff0000");
        $("#txtSurveyAnswer_" + questionid).css("border-color", "#ff0000");
        $("#txtSurveyAnswer_" + questionid).css("box-shadow", "0 0 0 0.2rem #ff0000");
        alert("Error: Wrong Input");
    }
}

/*
this function is used to change the row id of the table.
the row id when the calendar is click is schedulerow_<date>
after saving, this row id will be changed to the idx passed after adding the schedule to the database

this function will also change the click event parameter of the delete link

parameters:
currentRow: row object of the table
data: the returned data from the database after adding a schedule - data will contain the new idx
*/
function changeRowShedulerID(currentRow, data) {
    var idx = data.d;

    // clears onclick then sets click using jQuery
    if (idx > 0) {
        $(currentRow).attr("id", "schedulerow_" + idx);
        var s = $(currentRow).attr("id");
        $(currentRow).children('td').eq(2).find('input').val(idx.toString());

        $("#" + s + " > td > a").each(function () {
            var date = $(currentRow).children('td').eq(0).html();
            var newclick = 'deleteschedule(' + idx.toString() + ',\'' + date + '\')';

            $(this).attr('onclick', newclick);
        });

        var totalCountOfSchedules = parseInt($('#spanJobID_TotalCountOfSchedules_' + currentjobnum).html());
        var totalCountOfStoresNoSchedule = parseInt($('#spanJobID_CountOfStoresNoSchedule_' + currentjobnum).html());
        var completedtask = parseInt($("#jobinfo_completed_" + currentjobnum).html());
        $('#spanJobID_TotalCountOfSchedules_' + currentjobnum).text(1 + totalCountOfSchedules);
        $('#jobinfo_TotalCountOfSchedules_' + currentjobnum).text(1 + totalCountOfSchedules);
        $('#jobinfo_remainingtask_' + currentjobnum).text("(" + (1 + totalCountOfSchedules - completedtask) + ")");
    }
}

function editStoreInfo(StoreID) {

    //reset the values:
    $("#editstoretitle").text("");
    $("#txtstorename").val("");
    $("#txtStoreID").val("");
    $("#txtaddress1").val("");
    $("#txtaddress2").val("");
    $("#txtcity").val("");
    $("#txtzip").val("");
    $("#txtstate").val("");
    $("#txtPhoneAreaCode").val("");
    $("#txtPhoneNumber").val("");

    //get the store information by store id
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetStoreByStoreID",
        data: "{StoreID: " + StoreID.toString() + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populateStoreInfoForEdit(data, StoreID);
        },
        error: AjaxFailed
    });
}

function AddScheduleToStoreByIDx(jobnum, idfjobstoresassigned, storename, storezipcode, idx) {
    currentjobnum = jobnum;

    calendarStatus("inlinecalendar", false);

    $("#scheduler_parentIDx").val("0");
    $("#scheduler_issplit").val("false");
    $("#storeScheduler").text(storename);
    $("#scheduler_idfJobStoresAssigned").val(idfjobstoresassigned);
    $("#scheduler_zip").val(storezipcode);

    //get the list of reps by zip code and put in a variable listreps for dropdown

    if (storezipcode == "") {
        $.msgbox("ooops, I cannot get the nearest merchandisers without a zip code entered.<br />Please enter a store zip code.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
        return;
    }

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetCloseReps",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{zipcode: " + storezipcode + ", mileradius:" + maxDistance + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var reps = data.d;
            var curLbl = '<span class="badge badge-secondary">Current:</span><br />';
            var curRep = '<table><thead></thead><tbody><tr><td style="font-size:14px">' + curLbl + '<strong>Select a Merchandiser</strong></td></tr><tr><td>';
            var newLbl = '<span class="badge badge-tertiary">New:</span>';
            listreps = curRep + newLbl + '<input type="text" required class="form-control" id="payBox" list="scheduler_reps"' + 'onfocus="' + "this.value=''" +
                '" onchange="getpayrate(' + 'payBox' + ',' + idx + ')" name="scheduler_reps"' + 'style="margin-left: 0px; width: 280px"' +
                'placeholder="Select a Merchandiser"' + ' value="Select a Merchandiser"'+ '><datalist id="scheduler_reps" name="scheduler_reps">';
            jQuery.each(reps, function () {
                listreps += '<option value="' + this.RepNum + '">' + this.FirstName + ' ' + this.LastName + ' - Rep#: ' + this.RepNum + ' Loc: ' + this.City + ' Dist: ' + this.Distance + ' ml  - [$' + this.Rate + ']</option>';
            });

            listreps += '</datalist></td></tr></tbody></table>';
            $("#divLoader").css({ "display": "none" });
        },
        error: AjaxFailed
    });

    dates.length = 0;

    //post what's already saved
    $('#tblListOfSchedules > tbody').empty();
    $("#inlinecalendar").multiDatesPicker("resetDates");
    
    var dts = new Array();
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetSchedulesByIDx",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{IDx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var schedules = data.d;

            jQuery.each(schedules, function () {
                var newdate = formatjsondateMMDDYYYY(this.dateschedule);
                if (jQuery.inArray(newdate, dts) < 0) dts.push(newdate);
                if (newdate != "01/01/1" && newdate != "") {
                    var surveycomplete = false;
                    var surveyrequired = false;

                    if (this.surveyv == true) {
                        surveyrequired = true;
                        if (this.countofquestions <= this.countofanswers && this.countofquestions > 0) {
                            surveycomplete = true;
                        }
                        else {
                            surveycomplete = false;
                        }
                    }
                    else {
                        surveyrequired = false;
                        surveycomplete = false;
                    }

                    addRowToSchedule(newdate, this.repnum, this.idx, idfjobstoresassigned, returnHHMM(this.timein), returnHHMM(this.timeout), this.comment, this.expectedworkhours, this.billtype, this.mileage, this.payrate, this.totalexpectedhourswork, this.miscexpense, this.miscexpensereason, this.complete, surveyrequired, surveycomplete, this.photocount, this.mileagebillablerate, this.mileagetype, this.mileagepayablerate, this.managernote, this.adminnote, this.parentIDx, this.cases);
                }
                $("#scheduler_expectedtimein_" + this.idx).val(this.expectedtimein);
                $("#scheduler_timein_" + this.idx).val(returnHHMM(this.timein));
                $("#scheduler_timeout_" + this.idx).val(returnHHMM(this.timeout));
                $("#scheduler_mileage_" + this.idx).val(this.mileage);
                $("#scheduler_parentIDx_" + this.idx).val(this.parentIDx);

            });
            $("#divLoader").css({ "display": "none" });
            $("#divscheduler").css({ "display": "block" });
        },
        error: AjaxFailed
    });
    if (dts.length) {
        $("#inlinecalendar").multiDatesPicker('addDates', dts);
    }
}

/* This function is called by postStoresByJobnum */
function AddScheduleToStoreByIDxSplit(jobnum, idfjobstoresassigned, storename, storezipcode, parentIDx, idx) {
    currentjobnum = jobnum;

    calendarStatus("inlinecalendar", false);

    $("#scheduler_parentIDx").val(parentIDx);
    $("#scheduler_issplit").val("true");
    $("#storeScheduler").text("Split schedule for " + storename);
    $("#scheduler_idfJobStoresAssigned").val(idfjobstoresassigned);
    $("#scheduler_zip").val(storezipcode);

    //get the list of reps by zip code and put in a variable listreps for dropdown

    if (storezipcode == "") {
        $.msgbox("ooops, I cannot get the nearest merchandisers without a zip code entered.<br />Please enter a store zip code.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
        return;
    }

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetCloseReps",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{zipcode: " + storezipcode + ", mileradius:" + maxDistance + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var reps = data.d;
            var curLbl = '<span class="badge badge-secondary">Current:</span><br />';
            var curRep = '<table><thead></thead><tbody><tr><td style="font-size:14px">' + curLbl + '<strong>Select a Merchandiser</strong></td></tr><tr><td>';
            var newLbl = '<span class="badge badge-tertiary">New:</span>';
            listreps = curRep + newLbl + '<input type="text" required class="form-control" id="payBox" list="scheduler_reps" ' + 'onfocus="' + "this.value=''" +
                '" onchange="getpayrate(' + 'payBox' + ',' + idx + ')" name="scheduler_reps"' + 'style="margin-left: 0px; width: 280px"' +
                'placeholder="Select a Merchandiser"' + 'value="Select a Merchandiser">' + '<datalist id="scheduler_reps" name="scheduler_reps">';
            jQuery.each(reps, function () {
                listreps += '<option value="' + this.RepNum + '">' + this.FirstName + ' ' + this.LastName + ' - Rep#: ' + this.RepNum + ' Loc: ' + this.City + ' Dist: ' + this.Distance + ' ml  - [$' + this.Rate + ']</option>';
            });

            listreps += '</datalist></td></tr></tbody></table>';
            $("#divLoader").css({ "display": "none" });
        },
        error: AjaxFailed
    });

    dates.length = 0;

    //post what's already saved
    $('#tblListOfSchedules > tbody').empty();
    $("#inlinecalendar").multiDatesPicker("resetDates");

    var dts = new Array();
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetSchedulesByIDx",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{IDx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var schedules = data.d;

            jQuery.each(schedules, function () {
                var newdate = formatjsondateMMDDYYYY(this.dateschedule);
                if (jQuery.inArray(newdate, dts) < 0) dts.push(newdate);
                if (newdate != "01/01/1" && newdate != "") {
                    var surveycomplete = false;
                    var surveyrequired = false;

                    if (this.surveyv == true) {
                        surveyrequired = true;
                        if (this.countofquestions <= this.countofanswers && this.countofquestions > 0) {
                            surveycomplete = true;
                        }
                        else {
                            surveycomplete = false;
                        }
                    }
                    else {
                        surveyrequired = false;
                        surveycomplete = false;
                    }

                    addRowToSchedule(newdate, this.repnum, this.idx, idfjobstoresassigned, returnHHMM(this.timein), returnHHMM(this.timeout), this.comment, this.expectedworkhours, this.billtype, this.mileage, this.payrate, this.totalexpectedhourswork, this.miscexpense, this.miscexpensereason, this.complete, surveyrequired, surveycomplete, this.photocount, this.mileagebillablerate, this.mileagetype, this.mileagepayablerate, this.managernote, this.adminnote, this.parentIDx, this.cases);
                }
                $("#scheduler_expectedtimein_" + this.idx).val(this.expectedtimein);
                $("#scheduler_timein_" + this.idx).val(returnHHMM(this.timein));
                $("#scheduler_timeout_" + this.idx).val(returnHHMM(this.timeout));
                $("#scheduler_mileage_" + this.idx).val(this.mileage);

            });
            $("#divLoader").css({ "display": "none" });
            $("#divscheduler").css({ "display": "block" });
        },
        error: AjaxFailed
    });
    if (dts.length) {
        $("#inlinecalendar").multiDatesPicker('addDates', dts);
    }
}

function AddScheduleToStoreByIDxSplitParent(jobnum, idfjobstoresassigned, storename, storezipcode, idx) {
    currentjobnum = jobnum;

    calendarStatus("inlinecalendar", false);

    $("#scheduler_parentIDx").val(idx);
    $("#scheduler_issplit").val("true");
    $("#storeScheduler").text("Split schedule for " + storename);
    $("#scheduler_idfJobStoresAssigned").val(idfjobstoresassigned);
    $("#scheduler_zip").val(storezipcode);

    //get the list of reps by zip code and put in a variable listreps for dropdown

    if (storezipcode == "") {
        $.msgbox("ooops, I cannot get the nearest merchandisers without a zip code entered.<br />Please enter a store zip code.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
        return;
    }

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetCloseReps",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{zipcode: " + storezipcode + ", mileradius:" + maxDistance + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var reps = data.d;
            var curLbl = '<span class="badge badge-secondary">Current:</span><br />';
            var curRep = '<table><thead></thead><tbody><tr><td style="font-size:14px">' + curLbl + '<strong>Select a Merchandiser</strong></td></tr><tr><td>';
            var newLbl = '<span class="badge badge-tertiary">New:</span>';
            listreps = curRep + newLbl + '<input type="text" required class="form-control" id="payBox" list="scheduler_reps"' + 'onfocus="' + "this.value=''" +
                '" onchange="getpayrate(' + 'payBox' + ',' + idx + ')"  name="scheduler_reps" style="margin-left: 0px; width: 280px" placeholder="Select a Merchandiser"' + ' value="Select a Merchandiser">' + ' <datalist id="scheduler_reps" name="scheduler_reps">';
            jQuery.each(reps, function () {
                listreps += '<option value="' + this.RepNum.toString() + '">' + this.FirstName + ' ' + this.LastName + ' - Rep#: ' + this.RepNum.toString() + ' Loc: ' + this.City + ' Dist: ' + this.Distance.toString() + ' ml  - [$' + this.Rate + ']</option>';
            });

            listreps += '</datalist></td></tr></tbody></table>';
            $("#divLoader").css({ "display": "none" });
        },
        error: AjaxFailed
    });

    dates.length = 0;

    //post what's already saved
    $('#tblListOfSchedules > tbody').empty();
    $("#inlinecalendar").multiDatesPicker("resetDates");

    var dts = new Array();
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetSchedulesByIDxParent",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{IDx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var schedules = data.d;

            jQuery.each(schedules, function () {
                var newdate = formatjsondateMMDDYYYY(this.dateschedule);
                if (jQuery.inArray(newdate, dts) < 0) dts.push(newdate);
                if (newdate != "01/01/1" && newdate != "") {
                    var surveycomplete = false;
                    var surveyrequired = false;

                    if (this.surveyv == true) {
                        surveyrequired = true;
                        if (this.countofquestions <= this.countofanswers && this.countofquestions > 0) {
                            surveycomplete = true;
                        }
                        else {
                            surveycomplete = false;
                        }
                    }
                    else {
                        surveyrequired = false;
                        surveycomplete = false;
                    }

                    addRowToSchedule(newdate, this.repnum, this.idx, idfjobstoresassigned, returnHHMM(this.timein), returnHHMM(this.timeout), this.comment, this.expectedworkhours, this.billtype, this.mileage, this.payrate, this.totalexpectedhourswork, this.miscexpense, this.miscexpensereason, this.complete, surveyrequired, surveycomplete, this.photocount, this.mileagebillablerate, this.mileagetype, this.mileagepayablerate, this.managernote, this.adminnote, this.parentIDx, this.cases);
                }
                $("#scheduler_expectedtimein_" + this.idx).val(this.expectedtimein);
                $("#scheduler_timein_" + this.idx).val(returnHHMM(this.timein));
                $("#scheduler_timeout_" + this.idx).val(returnHHMM(this.timeout));
                $("#scheduler_mileage_" + this.idx).val(this.mileage);

            });
            $("#divLoader").css({ "display": "none" });
            $("#divscheduler").css({ "display": "block" });
        },
        error: AjaxFailed
    });
    if (dts.length) {
        $("#inlinecalendar").multiDatesPicker('addDates', dts);
    }
}

function AddScheduleToStore(jobnum, idfjobstoresassigned, storename, storezipcode, idx) {
    currentjobnum = jobnum;

    calendarStatus("inlinecalendar", false);

    $("#scheduler_parentIDx").val(0);
    $("#scheduler_issplit").val("false");
    $("#storeScheduler").text(storename);
    $("#scheduler_idfJobStoresAssigned").val(idfjobstoresassigned);
    $("#scheduler_zip").val(storezipcode);

    //get the list of reps by zip code and put in a variable listreps for dropdown

    if (storezipcode == "") {
        $.msgbox("ooops, I cannot get the nearest merchandisers without a zip code entered.<br />Please enter a store zip code.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
        return;
    }

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetCloseReps",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{zipcode: " + storezipcode + ", mileradius:" + maxDistance + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var reps = data.d;
            var curLbl = '<span class="badge badge-secondary">Current:</span><br />';
            var curRep = '<table><thead></thead><tbody><tr><td style="font-size:14px">' + curLbl + '<strong>Select a Merchandiser</strong></td></tr><tr><td>';
            var newLbl = '<span class="badge badge-tertiary">New:</span>';
            listreps = curRep + newLbl + '<input type="text" required class="form-control" id="payBox" list="scheduler_reps"' + 'onfocus="' + "this.value=''" +
                '" onchange="getpayrate(' + 'payBox'+ ',' + idx + ')" name="scheduler_reps"' +
                'style="margin-left: 0px; width: 280px"' + 'placeholder="Select a Merchandiser"' + 'value="Select a Merchandiser"' + ' autofocus><datalist id="scheduler_reps" name="scheduler_reps">';
            jQuery.each(reps, function () {
                listreps += '<option value="' + this.RepNum.toString() + '">' + this.FirstName + ' ' + this.LastName + ' - Rep#: ' + this.RepNum.toString() + ' Loc: ' + this.City + ' Dist: ' + this.Distance.toString() + ' ml  - [$' + this.Rate + ']</option>';
            });

            listreps += '</datalist></td></tr></tbody></table>';
            $("#divLoader").css({ "display": "none" });
        },
        error: AjaxFailed
    });

    dates.length = 0;

    //post what's already saved
    $('#tblListOfSchedules > tbody').empty();
    $("#inlinecalendar").multiDatesPicker("resetDates");

    var dts = new Array();
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetSchedules",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        data: "{idfjobstoresassigned: " + idfjobstoresassigned + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var schedules = data.d;

            jQuery.each(schedules, function () {
                var newdate = formatjsondateMMDDYYYY(this.dateschedule);
                if (jQuery.inArray(newdate, dts) < 0) dts.push(newdate);
                if (newdate != "01/01/1" && newdate != "") {
                    var surveycomplete = false;
                    var surveyrequired = false;

                    if (this.surveyv == true) {
                        surveyrequired = true;
                        if (this.countofquestions <= this.countofanswers && this.countofquestions > 0) {
                            surveycomplete = true;
                        }
                        else {
                            surveycomplete = false;
                        }
                    }
                    else {
                        surveyrequired = false;
                        surveycomplete = false;
                    }

                    addRowToSchedule(newdate, this.repnum, this.idx, idfjobstoresassigned, returnHHMM(this.timein), returnHHMM(this.timeout), this.comment, this.expectedworkhours, this.billtype, this.mileage, this.payrate, this.totalexpectedhourswork, this.miscexpense, this.miscexpensereason, this.complete, surveyrequired, surveycomplete, this.photocount, this.mileagebillablerate, this.mileagetype, this.mileagepayablerate, this.managernote, this.adminnote, this.parentIDx, this.cases);
                }
                $("#scheduler_expectedtimein_" + this.idx).val(this.expectedtimein);
                $("#scheduler_timein_" + this.idx).val(returnHHMM(this.timein));
                $("#scheduler_timeout_" + this.idx).val(returnHHMM(this.timeout));
                $("#scheduler_mileage_" + this.idx).val(this.mileage);

            });
            $("#divLoader").css({ "display": "none" });
            $("#divscheduler").css({ "display": "block" });
        },
        error: AjaxFailed
    });
    if (dts.length) {
        $("#inlinecalendar").multiDatesPicker('addDates', dts);
    }
}

/*
This function gets the schedule info for update
IDx is the unique id in table FJobStoreSchedule
*/
function EnterTimeIn(idfJobStoresAssigned, date) {
    dates.length = 0;

    //post what's already saved
    $('#tblListOfSchedules > tbody').empty();
    $("#inlinecalendar").multiDatesPicker("resetDates");

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetSchedulesByIDf_Date",
        data: "{idfJobStoresAssigned: " + idfJobStoresAssigned + ", date: '" + date + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            postSchedulesToEnterTimeInOut(idfJobStoresAssigned, data);
        },
        error: AjaxFailed
    });

    calendarStatus("inlinecalendar", false);
}

/*
This function gets the schedule info for update
IDx is the unique id in table FJobStoreSchedule
*/
function EnterTimeInByIDx(idx) {
    dates.length = 0;

    //post what's already saved
    $('#tblListOfSchedules > tbody').empty();
    $("#inlinecalendar").multiDatesPicker("resetDates");

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetSchedulesByIDx",
        data: "{IDx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            postSchedulesToEnterTimeInOut(idx, data);
        },
        error: AjaxFailed
    });

    calendarStatus("inlinecalendar", false);
}

function postSchedulesToEnterTimeInOut(idx, idf, data) {
    var ds = data.d;
    var dts = new Array();

    $("#scheduler_parentIDx").val(0);
    $("#scheduler_issplit").val("false");

    if (ds.length > 0) {
        jQuery.each(ds, function (d) {

            listreps = '<input type="text" id="scheduler_' + idx + '" list="scheduler_reps" name="scheduler_' + idx + '"' + '><datalist id="scheduler_reps" name="scheduler_reps">';
            listreps += '<option value="' + this.repnum.toString() + '">' + this.firstname + ' ' + this.lastname + ' - Rep#: ' + this.repnum.toString() + '</option>';
            listreps += '</datalist>';

            var newdate = formatjsondateMMDDYYYY(this.dateschedule);
            if (jQuery.inArray(newdate, dts) < 0) dts.push(newdate);

            var surveycomplete = false;
            var surveyrequired = false;

            if (this.surveyv == true) {
                surveyrequired = true;
                if (this.countofquestions <= this.countofanswers && this.countofquestions > 0) {
                    surveycomplete = true;
                }
                else {
                    surveycomplete = false;
                }
            }
            else {
                surveyrequired = false;
                surveycomplete = false;
            }

            addRowToSchedule(newdate, this.repnum, this.idx, this.idfjobstoresassigned, this.timein, this.timeout, this.comment, this.expectedworkhours, this.billtype, this.mileage, this.payrate, this.totalexpectedhourswork, this.miscexpense, this.miscexpensereason, this.complete, surveyrequired, surveycomplete, this.photocount, this.billmileagecost, this.mileagetype, this.mileagepayablerate, this.managernote, this.adminnote, this.parentIDx, this.cases);

            $("#storeScheduler").text(this.storename);
            $("#scheduler_idfJobStoresAssigned").val(this.idfjobstoresassigned);
            $("#scheduler_zip").val(this.storezipcode);

            $("#scheduler_expectedtimein_" + this.idx).val(this.expectedtimein);
            $("#scheduler_timein_" + this.idx).val(returnHHMM(this.timein));
            $("#scheduler_timeout_" + this.idx).val(returnHHMM(this.timeout));
            $("#scheduler_comment_" + this.idx).val(this.comment);
            $("#scheduler_mileage_" + this.idx).val(this.mileage);
            $("#scheduler_mileagepayablerate_" + this.idx).val(this.mileagepayablerate);

            $("#scheduler_payrate_" + this.idx).val(this.payrate);
            $("#scheduler_parentIDx_" + this.idx).val(this.parentIDx);

            var dTimeIn = new Date(returnMMDDYYHHMM(this.timein));
            var dTimeOut = new Date(returnMMDDYYHHMM(this.timeout));

            var timelapse = dTimeOut.getTime() - dTimeIn.getTime();
            var daysDifference = Math.floor(timelapse / 1000 / 60 / 60 / 24);
            timelapse -= daysDifference * 1000 * 60 * 60 * 24

            var hoursDifference = Math.floor(timelapse / 1000 / 60 / 60);
            timelapse -= hoursDifference * 1000 * 60 * 60

            var minutesDifference = Math.floor(timelapse / 1000 / 60);
            timelapse -= minutesDifference * 1000 * 60

            $("#divscheduler_workdays_" + this.idx).html(daysDifference);
            $("#divscheduler_workhours_" + this.idx).html(hoursDifference);
            $("#divscheduler_workminutes_" + this.idx).html(minutesDifference);

        });

        if (dts.length) {
            $("#inlinecalendar").multiDatesPicker('addDates', dts);
        }
    }
}

function populateExistingStoreSchedule(data) {
    var x = divs.indexOf(jobnum);
    if (x == null || x == -1) {
        divs[divs.length + 1] = jobnum;
        //get jobassn
        //currentjob = jobnum;

        getschedule(jobnum, storenum);
    }
    else {
        currentjobnum = jobnum;
        //divs.remove(x, 0);
    }
}

//This function is used to update a store info
function populateStoreInfoForEdit(result, StoreID) {
    var data = result.d;
    //initialize all contents:
    $("#editstoretitle").text("");
    $("#txtstorename").val("");
    $("#txtStoreID").val("");
    $("#txtaddress1").val("");
    $("#txtaddress2").val("");
    $("#txtcity").val("");
    $("#txtzip").val("");
    $("#txtstate").val("");
    $("#txtPhoneAreaCode").val("");
    $("#txtPhoneNumber").val("");

    //populate contents by data.d
    $("#editstoretitle").text(data.StoreName.toString() + '  (' + data.StoreID.toString() + ')');
    $("#txtstorename").val(data.StoreName.toString());
    $("#txtStoreID").val(data.StoreID.toString());
    $("#txtaddress1").val(data.Address1.toString());
    $("#txtaddress2").val(data.Address2.toString());
    $("#txtcity").val(data.City.toString());
    $("#txtzip").val(data.Zip.toString());
    $("#txtstate").val(data.ST.toString());
    $("#txtPhoneAreaCode").val(data.PhoneMain.toString().substring(1, 3));
    $("#txtPhoneNumber").val(data.PhoneMain.toString().substring(4, 6));
}

function postClientFromFilterList(id, client) {
    $("#txtClientFilter").val(client);
    $("#txtClientNum").val(id);
    GetContactsByClientNumActiveOnly(id);
    toggleDiv('divListOfClients', false, null);
}

function updateStoreInfo() {
    var par = "";
    par += "{StoreID:" + $("#txtStoreID").attr("value");
    par += ", storename: '" + Base64.encode($("#txtstorename").attr("value")) + "'";
    par += ", address1: '" + Base64.encode($("#txtaddress1").attr("value")) + "'";
    par += ", address2: '" + Base64.encode($("#txtaddress2").attr("value")) + "'";
    par += ", city: '" + Base64.encode($("#txtcity").attr("value")) + "'";
    par += ", st: '" + Base64.encode($("#txtstate").attr("value")) + "'";
    par += ", zip: '" + Base64.encode($("#txtzip").attr("value")) + "'";
    par += ", phoneareacode: '" + Base64.encode($("#txtPhoneAreaCode").attr("value")) + "'";
    par += ", phonemain: '" + Base64.encode($("#txtPhoneNumber").attr("value")) + "'";
    par += "}";

    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/UpdateStore",
        data: par,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.d == 1) {
                var spanid = currentjobnum.toString() + "_" + $("#txtStoreID").attr("value");
                $("#span_" + spanid + "_storename").text($("#txtstorename").attr("value"));
                $("#span_" + spanid + "_storecity").text($("#txtaddress1").attr("value") + " " + $("#txtcity").attr("value"));
                $("#span_" + spanid + "_storest").text($("#txtstate").attr("value"));
                $("#span_" + spanid + "_storezip").text($("#txtzip").attr("value"));

                GetStoresByJobNum(currentjobnum);

                $.msgbox($("#txtstorename").attr("value") + " was successfully updated.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });

            }
            else {
                $.msgbox("oops. Sorry, the update to " + $("#txtstorename").attr("value") + " was not successful.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
            }
        },
        error: AjaxFailed
    });
}

function getJobInfoToAddStore(jobnum) {
    currentjobnum = jobnum;

    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetJobByJobNum",
        data: "{JobNum: '" + jobnum + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populateJobInfoToAddStore(data, jobnum);
        },
        error: AjaxFailed
    });
}

//called from jobentry.aspx - must not be a mobile user
function GetStoresByJobNum(jobnum) {
    currentjobnum = jobnum;
    order = "asc";

    $("#storesbyjobnum_" + jobnum).find("th").each(function () {
        if ($(this).hasClass("sorttable_sorted_reverse")) {
            order = "desc"
        }
    });

    var startdate;
    var enddate;
    if (($("#txtSearchByStartDate").attr("value") != null) && ($("#txtSearchByStartDate").attr("value") != "")) {
        startdate = $("#txtSearchByStartDate").attr("value");
    }
    else {
        startdate = "1/1/2000";
    }

    if (($("#txtSearchByEndDate").attr("value") != null) && ($("#txtSearchByEndDate").attr("value") != "")) {
        enddate = $("#txtSearchByEndDate").attr("value") + " 11:59:59";
    }
    else {
        enddate = "12/31/2100";
    }

    var url = "";
    var params = "";

    if (ismobile) {
        url = "forceoneData.asmx/GetStoresByJobNum";
        params = "{JobNum: '" + jobnum + "', StartDate: '" + startdate + "', EndDate: '" + enddate + "'}";
    }
    else if (yilesed || teamlead || isclient) {
        url = "forceoneData.asmx/GetSchedulesByJobnumWithSort";
        params = "{jobnum: '" + jobnum + "', sortcolumn: " + storeschedulecolumnsorted.toString() + ", order: '" + order + "'}";
    }
    else {
        url = "forceoneData.asmx/GetStoresByJobNum";
        params = "{JobNum: '" + jobnum + "', StartDate: '" + startdate + "', EndDate: '" + enddate + "'}";
    }


    //if (ismobile || !yilesed || !teamlead) {
    //    url = "forceoneData.asmx/GetStoresByJobNum";
    //    params = "{JobNum: '" + jobnum + "', StartDate: '" + startdate + "', EndDate: '" + enddate + "'}";
    //}
    //else {
    //    url = "forceoneData.asmx/GetSchedulesByJobnumWithSort";
    //  params = "{jobnum: '" + jobnum + "', sortcolumn: " + storeschedulecolumnsorted.toString() + ", order: '" + order + "'}";
    // }

    //get default info for the job
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetJobByJobNum",
        data: "{JobNum: '" + jobnum + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var d = data.d;
            jobdefaultmileagetype = d[0].MileageType;
            jobdefaultmileagebillablerate = d[0].BillMileageCost;
            jobdefaultmileagepayablerate = d[0].PayrollMileageCost;
        },
        error: AjaxFailed
    });

    $.ajax({
        type: "POST",
        url: url,
        beforeSend: function () {
            //$("#divprogress" + jobnum).css("display", "block");
            $("#divprogress" + jobnum).show();
            if (yilesed || teamlead) {
                $("#divActionsJob" + jobnum.toString()).css({ "display": "none" });
            }
            showProgressBar(true, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 0);
            $("#accordion_inner" + jobnum.toString()).attr("display", "none");
            $("#divJobDetail" + jobnum.toString()).css({ "display": "none" });

        },
        data: params,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (ismobile) {
                postStoresByJobnumMobile(data, jobnum);
            }
            else if (yilesed || teamlead) {
                postStoresByJobnum(data, jobnum);
            }
            else if (isclient) {
                postStoresByJobnumClient(data, jobnum);
            }
            else {
                postStoresByJobnumMobile(data, jobnum);
            }
            /*
            if (ismobile && !yilesed && !teamlead) {
                postStoresByJobnumMobile(data, jobnum);
            }
            else {
                postStoresByJobnum(data, jobnum);
            }
            */
            showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 300);
            if (yilesed) {
                $("#divActionsJob" + jobnum.toString()).css("display", "block");
                $("#divActionsJob" + jobnum).show();
            }
            $("#divprogress" + jobnum).hide();
            $("#accordion_inner" + jobnum.toString()).attr("display", "block");
            $("#divJobDetail" + jobnum.toString()).css({ "display": "block" });
            if (yilesed && !ismobile) { reCalc($('#storesbyjobnum_' + jobnum.toString())); }
        },
        error: AjaxFailed
    });
}

function toggleView() {
    var viewButton = document.getElementById("toggleViewButton")
    if (ismobile) {
        ismobile = false;
        //alert("mobile: false");
        viewButton.innerHTML = '<i class="bi bi-pc-display-horizontal"></i>';
    }
    else {
        ismobile = true;
        //alert("mobile: true");
        viewButton.innerHTML = '<i class="bi bi-phone"></i>';
    }
    
}

function getjobbyjobnum(jobnum) {
    currentjobnum = jobnum;

    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetJobByJobNum",
        data: "{JobNum: '" + jobnum + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            postJobByJobnum(data, jobnum);
        },
        error: AjaxFailed
    });
}

function getPastDue() {
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetPastDue",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populatestore(data, StoreID);
        },
        error: AjaxFailed
    });
}

function populatePastDue(result) {
    var data = result.d;
    $("#messagecount").text("10");
}

function populateJobInfoToAddStore(result, jobnum) {
    //var data = result.d[0];
    $("#addStoreTitle").text("Add Store to Job # " + jobnum.toString() + " " + result.d[0].jobdesc.toString().replace(/(\'|\")/gm, '`'));
}

function newjob() {
    jobnum = 0;
    $("#editjobtitle").text("Enter New Job Info");
    $("#txtjobname").val("");
    $("#txtClientFilter").val("");
    $("#txtjobtypename").val("");
    $("#txtaccountexec").val("");
    $("#txtstartdate").val("");
    $("#txtenddate").val(""); //       Date(data.EndDate));
    $("#txtbillingrate").val("");
    $("#txtdutylevel").val("");
    $("#txttracking").val("");
    $("#" + $("#inputradbutton").val() + " option[value='0']").attr("selected", "selected");

    $("#txtdefaulthours").val("");
    $("#txtcomplete").val("");
    $("#txtClientNum").val("0");

    $("#" + $("#inputmileagetype").val() + " option[value='0']").attr("selected", "selected");
    $("#txtbillmileagecost").val("0");
    $("#txtpayrollmileagecost").val("0");
    $("#txtJobManagerComment").val("");
    $("#jobupdate_jobnum").val("0");
    $("#divListOfClients").hide();
    $("#txtcomplete").prop('disabled', true);
    $("#divMainContact").html("<select id='selMainContact'><option value = '0'>Select a contact person</option></select>");
    $("#divSecondContact").html("<select id='selSeoncContact'><option value = '0'>Select a contact person</option></select>");
    $("#divBillingContact").html("<select id='selBillingContact'><option value = '0'>Select a contact person</option></select>");
    $("#divInvoiceDate").html("");
}


function setFilter(jobnum) {
    var a = "myInput" + jobnum.toString();
    var b = "regionInput_" + jobnum.toString();
    var c = "addressInput_" + jobnum.toString();
    var d = "repInput_" + jobnum.toString();

    var _a, _b, _c, _d;
    _a = document.getElementById(a);
    _b = document.getElementById(b);
    _c = document.getElementById(c);
    _d = document.getElementById(d);

    if (_a.value !== '') {
        findSchedules(jobnum);
    }
    else if (_b.value !== '') {
        findRegion(jobnum);
    }
    else if (_c.value !== '') {
        findAddress(jobnum);
    }
    else if (_d.value !== '') {
        findRep(jobnum);
    }
}

//send notification to the reps for todays job
function notifyreps(jobnum) {
    $.msgbox("You are about to send an email notification for today's schedule to your reps. <br />Notifications will be sent to your reps for job number " + jobnum.toString() + "<br />Please click Yes to confirm.",
    {
        type: "confirm",
        buttons: [
            { type: "submit", value: "Yes" },
            { type: "cancel", value: "Cancel" }
        ]
    }, function (result) {
        if (result) {

            $.ajax({
                type: "POST",
                url: "forceoneData.asmx/SendNotification",
                beforeSend: function () {
                    showProgressBar(true, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 0);
                    $("#divJobDetail" + jobnum.toString()).css({ "display": "block" });
                },
                data: "{jobnum: " + jobnum.toString() + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.d == 0) {

                        showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 100);
                        $("#divJobDetail" + jobnum.toString()).css({ "display": "block" });
                        $.msgbox("No reps were notified.<br />It's probably because there were no reps scheduled today.", { type: "submit", value: "Ok" });
                    }
                    else if (data.d == 1) {
                        showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 100);
                        $("#divJobDetail" + jobnum.toString()).css({ "display": "block" });
                        $.msgbox("1 rep was notified.", { type: "submit", value: "Ok" });
                    }
                    else if (data.d > 1) {
                        showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 100);
                        $("#divJobDetail" + jobnum.toString()).css({ "display": "block" });
                        $.msgbox(data.d + " reps was notified.", { type: "submit", value: "Ok" });
                    }
                    else {
                        showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 100);
                        $("#divJobDetail" + jobnum.toString()).css({ "display": "block" });
                        $.msgbox("Error: No rep was notified.<br />It's probably because there were no reps scheduled today.", { type: "submit", value: "Ok" });
                    }
                },
                error: AjaxFailed
            }); //ajax
        }
    });
}

function notifyrepbyidx(jobnum, repnum, idx) {
    var btnNotify = document.getElementById("Notify" + idx);
    $.msgbox("You are about to send job number " + jobnum + " schedule to the rep.<br />Please click Yes to confirm.",
    {
        type: "confirm",
        buttons: [
            { type: "submit", value: "Yes" },
            { type: "cancel", value: "Cancel" }
        ]
    }, function (result) {
        if (result) {

            $.ajax({
                type: "POST",
                url: "forceoneData.asmx/SendNotificationByIDx",
                beforeSend: function () {
                    //$("#divJobDetail" + jobnum.toString()).css({ "display": "none" });
                    showProgressBar(true, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 0);
                },
                data: "{idx: " + idx + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.d == 0) {
                        showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 100);
                       // $("#divJobDetail" + jobnum.toString()).css({ "display": "block" });
                        $.msgbox("No rep was notified.", { type: "submit" });
                    }
                    else if (data.d > 0) {
                        showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 100);
                        //$("#divJobDetail" + jobnum.toString()).css({ "display": "block" });
                        $.msgbox("1 rep was notified.", { type: "submit" });
                        $(btnNotify)[0].className = 'btn btn-success';
                        $(btnNotify).text('Notified ' + repnum + '!');
                        $("#divstoresbyjobnum_repnum_" + idx).removeClass("warningstore");
                        $("#divstoresbyjobnum_repnum_" + idx).attr("class", "checkicon");
                    }
                    else {
                        showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 100);
                        //$("#divJobDetail" + jobnum.toString()).css({ "display": "block" });

                        $.msgbox(data.d + " reps was notified.", { type: "submit" });
                        $(btnNotify)[0].className = 'btn btn-success';
                        $(btnNotify).text('Notified ' + repnum + '!');
                    }
                },
                error: AjaxFailed
            }); //ajax
        }
    });
}

function saveUrgentText(idx, txtCM) {
    $.ajax({
        type: "POST",
        async: false,
        url: "forceoneData.asmx/UpdateUrgentText",
        data: "{idx: " + idx + ", txtCM: " + JSON.stringify(txtCM) + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
        },
        error: AjaxFailed
    });
}

function notifymanager(idx, txtCM) {
    var input = document.querySelector('#ctl00_placeholderBody_txtContactManager').value;
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/SendNotificationByIDxToManager",
        data: "{idx: " + idx + ", input: " + JSON.stringify(input) + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.d == 0) {
                alert("There was a problem contacting management...", { type: "submit" });
            }
            else {
                alert("A manager will contact you soon!");
                saveUrgentText(idx, txtCM);
            }
        },
        error: AjaxFailed
    }); //ajax
    $('#contactManagement').modal('toggle');
}

function setScheduleFlag(idx) {
    $.ajax({
        type: "POST",
        async: false,
        url: "forceoneData.asmx/SetScheduleFlag",
        data: "{idx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {

        },
        error: AjaxFailed
    }); //ajax
}

function postJobByJobnum(result, jobnum) {

    var data = result.d;

    //initialize job contents:
    $("#editjobtitle").text("");
    $("#txtjobname").val("");
    $("#txtClientFilter").val("");
    $("#txtjobtypename").val("");
    $("#txtaccountexec").val("");
    $("#txtstartdate").val("");
    $("#txtenddate").val(""); //       Date(data.EndDate));
    $("#txtbillingrate").val("");
    $("#txtdutylevel").val("");
    $("#txttracking").val("");
    $("#" + $("#inputradbutton").val() + " option[value='0']").attr("selected", "selected");
    $("#" + $("#inputmileagetype").val() + " option[value='0']").attr("selected", "selected");
    $("#" + $("#inputteamlead").val() + " option[value='0']").attr("selected", "selected");
    $("#txtdefaulthours").val("");
    $("#txtcomplete").val("");
    $("#txtClientNum").val("0");
    $("#jobupdate_jobnum").val("0");
    $("#txtcomplete").prop('disabled', false);
    $("#txtbillmileagecost").val("0");
    $("#txtpayrollmileagecost").val("0");
    $("#txtJobInfoManagerComment").val("");
    $("#divMainContact").html("<select><option>Select a contact person</option></select>");
    $("#divSecondContact").html("<select><option>Select a contact person</option></select>");
    $("#divBillingContact").html("<select><option>Select a contact person</option></select>");
    $("#divInvoiceDate").html("");

    //populate job info from data object
    $("#jobupdate_jobnum").val(jobnum);
    $("#editjobtitle").text(data[0].jobdesc + '  [' + jobnum + ']');

    if (data[0].jobtypenum != null) {
        $("#" + $("#inputjobtype").val() + " option[value='" + data[0].jobtypenum.toString() + "']").attr("selected", "selected");
    }
    if (data[0].acctexecnum != null) {
        $("#" + $("#inputacctexec").val() + " option[value='" + data[0].acctexecnum.toString() + "']").attr("selected", "selected");
    }
    if (data[0].teamlead != "") {
        $("#" + $("#inputteamlead").val() + " option[value='" + data[0].teamleaduserid + "']").attr("selected", "selected")

    }
    if (data[0].billtypeid != null) {
        $("#" + $("#inputbilltype").val() + " option[value='" + data[0].billtypeid.toString() + "']").attr("selected", "selected");
        if (data[0].billtypeid == 0) {
            $("#txtcomplete").prop('disabled', true);
        }
    }
    else {
        $("#txtcomplete").prop('disabled', true);
    }
    if (data[0].dutylevel != null) {
        $("#" + $("#inputdutylevel").val() + " option[value='" + data[0].dutylevel.toString() + "']").attr("selected", "selected");
    }
    if (data[0].surveyv != null) {
        $("#" + $("#inputradbutton").val() + " [value=" + data[0].surveyv.toString() + "]").attr("checked", "true");
    }
    if (data[0].TemplateNum != null) {
        $("#" + $("#inputtemplate").val() + " option[value='" + data[0].TemplateNum.toString() + "']").attr("selected", "selected");
    }
    else {
        $("#" + $("#inputtemplate").val() + " option[value='0']").attr("selected", "selected");
    }
    if (data[0].expectedworkhours != null) {
        $("#" + $("#inputexpectedworkhours").val() + " option[value='" + data[0].expectedworkhours.toString() + "']").attr("selected", "selected");
    }
    if (data[0].startdate != null) {
        $("#txtstartdate").val(formatjsondateMMDDYYYY(data[0].startdate));
    }
    if (data[0].enddate != null) {
        $("#txtenddate").val(formatjsondateMMDDYYYY(data[0].enddate)); //       Date(data[0].EndDate));
    }

    if (data[0].dutylevel != null) {
        $("#" + $("#inputmileagetype").val() + " option[value='" + data[0].MileageType.toString() + "']").attr("selected", "selected");
    }


    if (data[0].BillMileageCost != null) {
        $("#txtbillmileagecost").val(data[0].BillMileageCost.toFixed(2));
    }
    if (data[0].PayrollMileageCost != null) {
        $("#txtpayrollmileagecost").val(data[0].PayrollMileageCost.toFixed(2));
    }

    if (data[0].billrate != null) {
        $("#txtbillingrate").val(data[0].billrate.toFixed(2));
        if (data[0].billrate == 0) {
            $("#txtcomplete").prop('disabled', true);
        }
    }
    else {
        $("#txtcomplete").prop('disabled', true);
    }
    if (data[0].dutylevel != null) {
        $("#txtdutylevel").val(data[0].dutylevel.toString());
    }
    if (data[0].lockedby != null) {
        $("#txttracking").val(data[0].lockedby.toString());
    }
    if (data[0].invdate == "" || data[0].invdate == "0") {
        $("#txtcomplete").val("");
    }
    else {
        $("#txtcomplete").val(data[0].invdate);
    }
    if (data[0].InvoiceDate == "") {
        $("#divInvoiceDate").html("");
    }
    else {
        $("#divInvoiceDate").html("<a href='#divinvoicelist' data-bs-toggle='modal' onclick='getInvoicesByJobNum(" + data[0].jobnum + ")'; return false;>" + data[0].InvoiceDate + "</a>");
    }

    if (data[0].clientnum != null) {
        $("#txtClientNum").val(data[0].clientnum);

        if (data[0].clientnum != 0) {
            GetContactsByClientNumActiveOnly(data[0].clientnum);

            if (data[0].maincontactid != null) {
                if (data[0].maincontactid != 0) {
                    $("#selMainContact option[value='" + data[0].maincontactid + "']").attr("selected", "selected");
                }
            }

            if (data[0].secondcontactid != null) {
                if (data[0].secondcontactid != 0) {
                    $("#selSecondContact option[value='" + data[0].secondcontactid + "']").attr("selected", "selected");
                }
            }

            if (data[0].billingcontactid != null) {
                if (data[0].billingcontactid != 0) {
                    $("#selBillingContact option[value='" + data[0].billingcontactid + "']").attr("selected", "selected");
                }
            }
        }

        if (data[0].clientnum == 0) {
            $("#txtcomplete").prop('disabled', true);
        }
    }
    else {
        $("#txtcomplete").prop('disabled', true);
    }
    if (data[0].jobdesc != null) {
        $("#txtjobname").val(data[0].jobdesc.toString());
    }
    if (data[0].clientname != null) {
        $("#txtClientFilter").val(data[0].clientname.toString());
    }
    if (data[0].managercomment != null) {
        $("#txtJobInfoManagerComment").val(data[0].managercomment.toString());
    }
    $("#divListOfClients").hide();

}

function postStoresByJobnumMobile(result, jobnum) {
    var data = result.d;
    var s = '';
    s += '<center><input style="max-width:85%;text-align:center" class="form-control" onkeyup="findSchedules(' + jobnum + ')"' + 'placeholder="Search for stores..." id="myInput' + jobnum + '"></center>';
    s += '<div class="clear" style="padding-bottom: 10px; padding-top: 10px"></div>';
    s += '<div class="span11" style="position:float; margin-left:auto; margin-right:auto; vertical-align:text-top;">';
    s += '<table id="storesbyjobnum_' + jobnum.toString() + '" class="table table-light" style="width:100%">';
    s += '<thead>';
    s += '  <tr>';
    s += '      <th style="min-width:100px; width:740px;text-align:center">Store Information</th>';
    s += '  </tr>';
    s += '</thead>';
    s += '<tbody>';
    //-----------------------------------------------------------------------------------------------------------
    var currRow;

    if (data.length > 0) {
        jQuery.each(data, function (rec) {
            var spanid = jobnum.toString() + '_' + data[rec].StoreID.toString();
            s += '<tr>';

            s += '  <td style="min-width:100px;text-align:center"><span style="font-weight:bold;" id="span_' + spanid + '_storename">+  <a style="color:#0d6efd" onclick="mapKeepShow=true; hoverToolTip(this, \'' + data[rec].StoreName.toString().replace("'", "`") + '\', \'' + data[rec].Address1 + ' ' + data[rec].City + ', ' + data[rec].ST + ' ' + data[rec].Zip + '\', \'spanMapViewer\', true); return false;" onmouseout="hoverToolTip(this,\'\', \'spanMapViewer\', false)" class="" href="javascript:;">' + data[rec].StoreName.toString() + '  (' + data[rec].StoreNumber.toString() + ')</a></span><br />';
            s += '          <span id="span_' + spanid + '_storecity">' + data[rec].Address1.toString() + '<br />' + data[rec].City.toString() + ', ' + data[rec].ST.toString() + ' ' + data[rec].Zip.toString() + '</span><br />';

            if (data[rec].Schedules == "") {
                s += '<div id="warningstore_idfJobStoresAssigned_' + data[rec].idfJobStoresAssigned.toString() + '" class="warningstore" style="display:block">&nbsp;</div>';
                s += '<div id="storescheduleinfo_idfJobStoresAssigned_' + data[rec].idfJobStoresAssigned.toString() + '"><span class="badge badge-dark-blue" style="visibility:hidden">' + data[rec].Schedules + '</span></div>';
            }
            else {
                s += '<div id="warningstore_idfJobStoresAssigned_' + data[rec].idfJobStoresAssigned.toString() + '" class="warningstore" style="display:none">&nbsp;</div>';
                s += '<div id="storescheduleinfo_idfJobStoresAssigned_' + data[rec].idfJobStoresAssigned.toString() + '">';

                if (yilesed || teamlead) { // Get the Scheduler if role applies
                    s += '<div style="padding:5px" class=""></div>'; // Add Padding
                    var scheduler = getScheduler(data[rec]);
                    s += scheduler;
                    s += '</div>';
                }
                else {
                    var dts = makeschedulelabels(data[rec].idfJobStoresAssigned.toString(), data[rec].Schedules);
                    s += dts;
                    s += '</div>';
                }
            }

            s += '  </div>';

            var v = 0;

            var scheds = data[rec].Schedules.split("^");
            var completed = 0;

            for (var i = 0; i <= scheds.length - 1; i++) {
                if (scheds[i] != "") {

                    var info = scheds[i].split("|");

                    var status = info[9];
                    if (status == "Complete") { completed++; }
                }
            }

            if (parseFloat(data[rec].storecount) > 0) {
                v = Math.round((completed / parseFloat(data[rec].storecount)) * 100, 2);
            }

            //s += '  <td style="text-align:center;"><span id="span_' + spanid + '_storestatus">' + v.toString() + '%';
            s += '  </span></td>';
            s += '</tr>';


            var p_length;
            p_length = ((rec + 1) / data.length) * 100;
            $("#progressbar" + jobnum.toString()).css("width", p_length.toString() + "%");
            async: false;
        });                              //<!--jQuery-->
    }
    s += '</tbody></table>';
    s += '</div>';
    s += '</div>'; // close schedules

    $("#divJobAssn" + jobnum.toString()).html(s);
}

function getScheduler(data) {
    var s = '';
    var info = data.Schedules.split("|");
    var idx = info[5].trim();
    var repnum = info[2].trim();
    var idf = data.idfJobStoresAssigned;
    var jobnum = data.JobNum;
    var zip = data.Zip;
    if (jobnum > 0 && idx > 0) {
        // Build the Buttons for the Tabs
        s = '<nav>';
        s += '<div class="nav nav-tabs" id="nav-tab' + idx + '" role = "tablist">';
        s += '<button class="nav-link active" onclick="repopulateDateLabelsStoreSchedule(' + idf + ')" id="nav-schedules-tab' + idx + '" data-bs-toggle="tab" data-bs-target="#nav-schedules' + idx + '" type="button" role="tab" aria-controls="nav-schedules' + idx + '" aria-selected="true"><i class="bi bi-truck"></i></button>';
        s += '<button class="nav-link" onclick="AddScheduleToStoreByIDxMobile(' + jobnum + ',' + idf + ',\'' + zip + '\',' + idx + ');" id="nav-scheduler-tab' + idx + '" data-bs-toggle="tab" data-bs-target="#nav-scheduler' + idx + '" type="button" role="tab" aria-controls="nav-scheduler' + idx + '" aria-selected="false" tabindex="-1"><i class="bi bi-calendar-event"></i></button>';
        s += '</div>';
        s += '</nav>'; // close tab buttons

        // Create the Content for the Tabs
        s += '<div class="tab-content" id ="nav-tabContent' + idx + '">';
        s += '<div class="tab-pane fade show active" id="nav-schedules' + idx + '" role="tabpanel" aria-labelledby="nav-schedules-tab' + idx + '">';
        var dts = makeschedulelabels(idf, data.Schedules);
        s += dts;
        s += '</div>';
        s += '<div class="tab-pane fade" id="nav-scheduler' + idx + '" role="tabpanel" aria-labelledby="nav-scheduler-tab' + idx + '">';
        // scheduler goes here
        s += '<table id="tblListOfSchedules' + idx + '" class="table table-light table-striped table-sm" style="min-width:270px;table-layout:fixed;width:100%;">';
        s += '<tbody>';
        s += '<tr>';
        s += '<tr><td colspan="2"><center id="cNotify' + idx + '"><button id="Notify' + idx + '" type="button" class="btn btn-primary" onclick="notifyrepbyidx(' + jobnum + ',' + repnum + ',' + idx + ')" style="min-width:75%">Notfiy</button></center></td></tr>'; // Notify
        s += '<td>Merchandiser</td>';
        s += '<td><select onchange="saveMerchandiserMobile(' + idx + ')" class="form-control" id="Merchandisers' + idx + '"></select>'; // Merchandiser
        s += '</tr>';
        s += '<tr>';
        s += '<td>Pay Rate</td>';
        s += '<td><input type="number" onchange="savePayRate(' + idx + ')" id="PayRate' + idx + '" style="width:100%;" class="form-control"></td>'; // PayRate
        s += '</tr>';
        s += '<tr>';
        s += '<td>Expected Time</td>';
        s += '<td><input type="time" onchange="saveExpectedTimeMobile(' + idx + ')"  id="ExpectedTime' + idx + '" style="width:100%;" class="form-control"></td>'; // ExpectedTime
        s += '</tr>';
        s += '<tr>';
        s += '<td>Start Time</td>';
        s += '<td><input type="datetime-local" onchange="saveStartTimeMobile(' + idx + ')" id="StartTime' + idx + '" style="width:100%;" class="form-control"></td>'; // StartTime
        s += '</tr>';
        s += '<tr>';
        s += '<td>End Time</td>';
        s += '<td><input type="datetime-local" onchange="saveEndTimeMobile(' + idx + ')" id="EndTime' + idx + '" style="width:100%;" class="form-control"></td>'; // EndTime
        s += '</tr>';
        s += '<tr>';
        s += '<td>Rep Comment</td>';
        s += '<td><textarea rows="5" onchange="saveMerchandiserCommentMobile(' + idx + ')" id="MerchandiserComment' + idx + '" rows="5" style="width:100%;" class="form-control"></textarea></td>'; // MerchandiserComment
        s += '</tr>';
        s += '<tr>';
        s += '<td>EWH</td>';
        s += '<td><input type="number" onchange="saveExpectedWorkHoursMobile(' + idx + ')" id="ExpectedWorkHours' + idx + '" style="width:100%;" class="form-control"></td>'; // ExpectedWorkHours
        s += '</tr>';
        s += '<tr>';
        s += '<td>CWH</td>';
        s += '<td><input type="number" id="CalculatedWorkHours' + idx + '" style="width:100%;" class="form-control" disabled></td>'; // CalculatedWorkHours
        s += '</tr>';
        s += '<tr>';
        s += '<td>Cases</td>';
        s += '<td><input type="number" id="Cases' + idx + '" style="width:100%;" class="form-control" disabled></td>'; // Cases
        s += '</tr>';
        s += '<tr>';
        s += '<td>Misc. Exp</td>';
        s += '<td><input type="number" onchange="saveMiscExpMobile(' + idx + ')" id="MiscExp' + idx + '" style="width:100%;" class="form-control"></td>'; // MiscExp
        s += '</tr>';
        s += '<tr>';
        s += '<td>Exp. Reason</td>';
        s += '<td><input type="text" onchange="saveMiscExpReasonMobile(' + idx + ')"  id="MiscExpReason' + idx + '" style="width:100%;" class="form-control"></td>'; // MiscExpReason
        s += '</tr>';
        s += '<tr>';
        s += '<td>Manager Note</td>';
        s += '<td><textarea rows="5" onchange="saveManagerNoteMobile(' + idx + ')"  id="ManagerNote' + idx + '" style="width:100%;" class="form-control"></textarea></td>'; // ManagerNote
        s += '</tr>';
        s += '<tr>';
        s += '<td>Admin Note</td>';
        s += '<td><textarea rows="5" onchange="saveAdminNoteMobile(' + idx + ')"  id="AdminNote' + idx + '" style="width:100%;" class="form-control"></textarea></td>'; // AdminNote
        s += '</tr>';
        s += '</tbody>';
        s += '</table>';
        s += '</div>';
        s += '</div>'; // close nav-tabContent

    } else { s = 'NO SHIFT AVAILABLE!'; }
    return s;
}

function AddScheduleToStoreByIDxMobile(jobnum, idfjobstoresassigned, zip, idx) {
    currentjobnum = jobnum;

    var drpReps = document.getElementById("Merchandisers" + idx);
    //get the list of reps by zip code and put in a variable listreps for dropdown

    if (zip == "") {
        $.msgbox("ooops, I cannot get the nearest merchandisers without a zip code entered.<br />Please enter a store zip code.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
        return;
    }
    
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetCloseReps",
        data: "{zipcode: " + zip + ", mileradius:" + maxDistance + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var reps = data.d;
            drpReps.innerHTML = '';
            var options = '';
            jQuery.each(reps, function () {
                options += '<option value="' + this.RepNum + '">' + this.FirstName + ' ' + this.LastName + ' - Rep#: ' + this.RepNum + ' Loc: ' + this.City + ' Dist: ' + this.Distance + ' ml  - [$' + this.Rate + ']</option>';
            });
            $(drpReps).html(options);
        },
        error: AjaxFailed
    });
    
    var dts = new Array();
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetSchedulesByIDx",
        data: "{IDx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var schedules = data.d;

            var btnNotify = document.getElementById("Notify" + idx);
            var PayRate = document.getElementById("PayRate" + idx);
            var ExpectedTime = document.getElementById("ExpectedTime" + idx);
            var StartTime = document.getElementById("StartTime" + idx);
            var EndTime = document.getElementById("EndTime" + idx);
            var MerchandiserComment = document.getElementById("MerchandiserComment" + idx);
            var ExpectedWorkHours = document.getElementById("ExpectedWorkHours" + idx);
            var CalculatedWorkHours = document.getElementById("CalculatedWorkHours" + idx);
            var Cases = document.getElementById("Cases" + idx);
            var MiscExp = document.getElementById("MiscExp" + idx);
            var MiscExpReason = document.getElementById("MiscExpReason" + idx);
            var ManagerNote = document.getElementById("ManagerNote" + idx);
            var AdminNote = document.getElementById("AdminNote" + idx);

            if (cantEdit(idx)) {
                //alert("This shift has already been paid. No changes are allowed!");
                $(btnNotify).prop('disabled', true);
                $(drpReps).prop('disabled', true);
                $(PayRate).prop('disabled', true);
                $(ExpectedTime).prop('disabled', true);
                $(StartTime).prop('disabled', true);
                $(EndTime).prop('disabled', true);
                $(MerchandiserComment).prop('disabled', true);
                $(ExpectedWorkHours).prop('disabled', true);
                $(CalculatedWorkHours).prop('disabled', true);
                $(Cases).prop('disabled', true);
                $(MiscExp).prop('disabled', true);
                $(MiscExpReason).prop('disabled', true);
                $(ManagerNote).prop('disabled', true);
                $(AdminNote).prop('disabled', true);
            }
            $(btnNotify).text("Notify " + schedules[0].firstname);
            if (schedules[0].isnotified) {
                $(btnNotify)[0].className = 'btn btn-success';
            } else {
                $(btnNotify)[0].className = 'btn btn-warning';
            }
            $(drpReps).val(schedules[0].repnum);
            $(PayRate).val(schedules[0].payrate);
            ExpectedTime.value = formatTime(new Date('1900-01-01 ' + schedules[0].expectedtimein));
            $(StartTime).val(datetimeLocal(parseJsonDate(schedules[0].timein)));
            $(EndTime).val(datetimeLocal(parseJsonDate(schedules[0].timeout)));
            $(MerchandiserComment).text(schedules[0].comment);
            $(ExpectedWorkHours).val(schedules[0].totalexpectedhourswork);
            $(CalculatedWorkHours).val((schedules[0].cases/23).toFixed(1));
            $(Cases).val(schedules[0].cases);
            $(MiscExp).val(schedules[0].miscexpense);
            $(MiscExpReason).val(schedules[0].miscexpensereason);
            $(ManagerNote).text(schedules[0].managernote);
            $(AdminNote).text(schedules[0].adminnote);

            $('#Merchandisers' + idx).select2();
        },
        error: AjaxFailed
    });
    
}

function setGood(id) {
    $(id).css("border-color", "#00FF00");
    $(id).css("box-shadow", "0 0 0 0.2rem #00FF00");
}

function setBad(id) {
    $(id).css("border-color", "#ff0000");
    $(id).css("box-shadow", "0 0 0 0.2rem #ff0000");
}

function setWarning(id) {
    $(id).css("border-color", "#FFFF00");
    $(id).css("box-shadow", "0 0 0 0.2rem #FFFF00");
}

function setNormal(id) {
    $(id).css("border-color", "");
    $(id).css("box-shadow", "");
}

function saveMerchandiserMobile(idx) {
    var cbtnNotify = document.getElementById("cNotify" + idx);
    var Merchandiser = document.getElementById("Merchandisers" + idx);
    var PayRate = document.getElementById("PayRate" + idx);
    var select = document.getElementById("select2-Merchandisers" + idx + "-container");
    var repnum = Merchandiser.value;
    var jobnum = currentjobnum;
    var btnNotify = '<button id="Notify' + idx + '" type="button" class="btn btn-warning" onclick="notifyrepbyidx(' + jobnum + ',' + repnum + ',' + idx + ')" style="min-width:75%">Notify new rep <b style="color:blue">' + repnum + '?</b></button>';
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateRepNumMobile",
        data: "{idx: " + idx + ", repnum: " + parseInt(repnum) + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            d = data.d;
            if (d > 0) {
                $(PayRate).val(d);
                setGood(PayRate);
                setGood(select);
                cbtnNotify.innerHTML = btnNotify;
            }
            else {
                alert("ERROR: The merchandiser pay rate can't populate properly! Please verify it is correct!");
                setBad(PayRate);
            }
        },
        error: AjaxFailed
    });
}

function savePayRate(idx) {
    var PayRate = document.getElementById("PayRate" + idx);
    var rate = $(PayRate).val();

    if (rate > 30) {
        setBad(PayRate);
        return alert("The pay rate entered is greater than 30. Please enter a lower payrate!");
    }
    else {
        $.ajax({
            async: false,
            type: "POST",
            url: "forceoneData.asmx/UpdatePayRateMobile",
            data: "{idx: " + idx + ", rate: " + rate + "}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                setGood(PayRate);
            },
            error: AjaxFailed
        });
    }
}

function saveExpectedTimeMobile(idx) {

    var ExpectedTime = document.getElementById("ExpectedTime" + idx);
    var expectedtime = ExpectedTime.value;

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateExpectedTimeMobile",
        data: "{idx: " + idx + ", expectedtime: '" + Base64.encode(expectedtime) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            setGood(ExpectedTime);
        },
        error: AjaxFailed
    });
}

function saveStartTimeMobile(idx) {

    var StartTime = document.getElementById("StartTime" + idx);
    var timein = $(StartTime).val();

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateTimeInMobile",
        data: "{idx: " + idx + ", timein: '" + Base64.encode(timein) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            setGood(StartTime);
        },
        error: AjaxFailed
    });
}

function saveEndTimeMobile(idx) {

    var EndTime = document.getElementById("EndTime" + idx);
    var timeout = $(EndTime).val();

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateTimeOutMobile",
        data: "{idx: " + idx + ", timeout: '" + Base64.encode(timeout) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            setGood(EndTime);
        },
        error: AjaxFailed
    });
}

function saveMerchandiserCommentMobile(idx) {

    var MerchandiserComment = document.getElementById("MerchandiserComment" + idx);
    var comment = $(MerchandiserComment).val();

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateMerchandiserCommentMobile",
        data: "{idx: " + idx + ", comment: '" + Base64.encode(comment) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            setGood(MerchandiserComment);
        },
        error: AjaxFailed
    });
}

function saveExpectedWorkHoursMobile(idx) {

    var ExpectedWorkHours = document.getElementById("ExpectedWorkHours" + idx);
    var CalculatedWorkHours = document.getElementById("CalculatedWorkHours" + idx);

    var ewh = $(ExpectedWorkHours).val();
    var cwh = $(CalculatedWorkHours).val();
    if (ewh > cwh) {
        if (confirm("Expected Work Hours are GREATER than Calculated Work Hours!\n\nDo you still wish to proceed?")) {
            $.ajax({
                async: false,
                type: "POST",
                url: "forceoneData.asmx/UpdateExpectedWorkHoursMobile",
                data: "{idx: " + idx + ", ewh: " + ewh + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    setWarning(ExpectedWorkHours);
                },
                error: AjaxFailed
            });
        }
        else { 
            $(ExpectedWorkHours).val('');
            setNormal(ExpectedWorkHours);
        }
    } else {
        $.ajax({
            async: false,
            type: "POST",
            url: "forceoneData.asmx/UpdateExpectedWorkHoursMobile",
            data: "{idx: " + idx + ", ewh: " + ewh + "}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                setGood(ExpectedWorkHours);
            },
            error: AjaxFailed
        });
    }
}

function saveMiscExpMobile(idx) {

    var MiscExp = document.getElementById("MiscExp" + idx);
    var exp = $(MiscExp).val();
    if (exp < 0) {
        exp = 0;
    }

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateMiscExpMobile",
        data: "{idx: " + idx + ", exp: " + exp + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            setGood(MiscExp);
        },
        error: AjaxFailed
    });
}

function saveMiscExpReasonMobile(idx) {

    var MiscExpReason = document.getElementById("MiscExpReason" + idx);
    var reason = $(MiscExpReason).val();

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateMiscExpReasonMobile",
        data: "{idx: " + idx + ", reason: '" + Base64.encode(reason) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            setGood(MiscExpReason);
        },
        error: AjaxFailed
    });
}

function saveManagerNoteMobile(idx) {

    var ManagerNote = document.getElementById("ManagerNote" + idx);
    var managernote = $(ManagerNote).val();

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateManagerNoteMobile",
        data: "{idx: " + idx + ", managernote: '" + Base64.encode(managernote) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            setGood(ManagerNote);
        },
        error: AjaxFailed
    });
}

function saveAdminNoteMobile(idx) {

    var AdminNote = document.getElementById("AdminNote" + idx);
    var adminnote = $(AdminNote).val();

    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateAdminNoteMobile",
        data: "{idx: " + idx + ", adminnote: '" + Base64.encode(adminnote) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            setGood(AdminNote);
        },
        error: AjaxFailed
    });
}

// Function which returns a minimum of two digits in case the value is less than 10
const getTwoDigits = (value) => value < 10 ? `0${value}` : value;

const formatDate = (date) => {
    const day = getTwoDigits(date.getDate());
    const month = getTwoDigits(date.getMonth() + 1); // add 1 since getMonth returns 0-11 for the months
    const year = date.getFullYear();

    return `${year}-${month}-${day}`;
}

const formatTime = (date) => {
  const hours = getTwoDigits(date.getHours());
  const mins = getTwoDigits(date.getMinutes());

  return `${hours}:${mins}`;
}

function datetimeLocal(datetime) {
    if (Object.prototype.toString.call(datetime) === '[object Date]') {
        const dt = new Date(datetime);
        dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
        return dt.toISOString().slice(0, 16);
    } else { return; }
}

function parseJsonDate(jsonDateString) {
    if (jsonDateString)
        return new Date(parseInt(jsonDateString.replace('/Date(', '')));
    else
        return;
}

function cantEdit(idx) {
    var flag = false;
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/IsPaid",
        data: "{idx: " + idx + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            flag = data.d;
        },
        error: AjaxFailed
    });
    return flag;
}

function findSchedules(jobnum) {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInput" + jobnum.toString());
    filter = input.value.toUpperCase();
    table = document.getElementById("storesbyjobnum_" + jobnum.toString());
    tr = table.getElementsByTagName("tr");

 
    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function findRegion(jobnum) {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("regionInput_" + jobnum.toString());
    filter = input.value.toUpperCase();
    table = document.getElementById("storesbyjobnum_" + jobnum.toString());
    tr = table.getElementsByTagName("tr");


    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function findRep(jobnum) {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("repInput_" + jobnum.toString());
    filter = input.value.toUpperCase();
    table = document.getElementById("storesbyjobnum_" + jobnum.toString());
    tr = table.getElementsByTagName("tr");


    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[4];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function findAddress(jobnum) {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("addressInput_" + jobnum.toString());
    filter = input.value.toUpperCase();
    table = document.getElementById("storesbyjobnum_" + jobnum.toString());
    tr = table.getElementsByTagName("tr");


    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[3];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function postStoresByJobnum(result, jobnum) {
    var data = result.d;
    var b1 = '<i class="bi bi-calendar - event"></i>';
    var b2 = '<i class="bi bi-calendar3"></i>';
    var b3 = '<i class="bi bi-diagram-3-fill"></i>';
    var b4 = '<i class="bi bi-magic"></i>';
    var b5 = '<i class="bi bi-x"></i>';
    var b6 = '<i class="bi bi-trash"></i>';
            
    var s = '<div class="table-responsive" style="position:float; margin-left:auto; margin-right:auto; vertical-align:text-top;">';
  
    s += '<table id="storesbyjobnum_' + jobnum.toString() + '" class="table table-light hover">'; // removed clear table-bordered table-striped table-highlight - NJS:5/17/2023
    s += '<thead>';
    s += '  <tr>';
    s += '      <th style="z-index:0;width:40px">Region</th>';
    s += '      <th style="z-index:0;width:75px">Store #</th>';
    s += '      <th style="z-index:0;width:60px">Store Name</th>';
    s += '      <th style="z-index:0;width:60px">Store Address</th>';
    s += '      <th style="z-index:0;width:60px">Rep Name</th>';
    s += '      <th style="z-index:0;width:50px">Date Schedule</th>';
    s += '      <th style="z-index:0;width:40px">Notify / Accept</th>';
    s += '      <th style="z-index:0;width:50px">Time In</th>';
    s += '      <th style="z-index:0;width:50px">Time Out</th>';
    s += '      <th style="z-index:0;width:40px">Survey</th > ';
    //s += '      <th style="z-index:0">Photo</th>';
    s += '      <th style="z-index:0;width:20px;">Mileage</th > ';
    s += '      <th style="z-index:0;width:40px">AFP</th>';
    s += '      <th style="z-index:0;width:40px">Paid</th > ';
    s += '      <th style="z-index:0;width:40px">Inv</th>';
    s += '      <th style="z-index:0;width:40px;text-align:center">Rep Comment</th>';
    s += '      <th style="z-index:0;width:40px;text-align:center">Manager Note</th>';
    s += '      <th style="z-index:0;width:40px;text-align:center">Admin Note</th>';
    //s += '      <th style="z-index:0">Manager Note</th>';
    //s += '      <th style="z-index:0">Admin Note</th>';
    s += '      <th style="z-index:0;width:40px">Urgent</th>';
    s += '      <th style="z-index:0;max-width:40px">ID</th>';
    s += '  </tr>';
    s += '</thead>';
    s += '<tbody>';

    if (data.length > 0) {
        jQuery.each(data, function (rec) {
            var spanid = jobnum.toString() + '_' + data[rec].storeid.toString();
            // <a id='lnkAddStore<%# Eval("jobnum").ToString() %>' onclick='getJobInfoToAddStore(<%# Eval("jobnum").ToString() %>)' class="btn btn-large btn-tertiary" data-toggle="modal" href="#divScheduler">Add Store</a>
            s += '<tr class="postStoresByJobnum_' + data[rec].idfjobstoresassigned + '" id="postStoresByJobnumIDX_' + data[rec].idx + '" onclick="colorparentchild(\'' + data[rec].IsSplit.trim() + '\', ' + data[rec].idx.toString() + ',' + data[rec].parentIDx.toString() + ',' + data[rec].jobnum.toString() + ');" IsParent="' + data[rec].IsSplit + '" IDx="' + data[rec].idx.toString() + '" ParentIDx="' + data[rec].parentIDx.toString() + '"  >';
 
            if (yilesed) {
                s += ' <td style="vertical-align:top"><div style="height:7px"></div>';
                if (data[rec].region !== null) {
                    s += data[rec].region.toString();
                }
                else {
                    s += '-';
                }

                s += '</td>'

                s += '  <td style="max-width:100px;">';
                s += ''
                s += '  <div class="dropdown dropend" style="text-align:center">';
                s += '  <a class="btn btn-outline-primary dropdown-toggle" style="width:70px;max-width:100px" href="#" role="button" id="dropdownMenuLinkSchedule' + jobnum +'" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">';
                    // Store #
                    s += data[rec].storenumber;
                s += '</a>';
                s += '<div class="dropdown-menu" style="min-width: 30px;" aria-labelledby="dropdownMenuLinkSchedule' + jobnum + '">';
                if (data[rec].IsSplit == "N") {
                    if (data[rec].parentIDx.toString() == "0") {
                        s += '  <a type="button" data-bs-toggle="tooltip" data-bs-placement="right" title="Get Shift." class="dropdown-item" onclick="AddScheduleToStoreByIDx(' + jobnum + ', ' + data[rec].idfjobstoresassigned.toString() + ',\'' + data[rec].storename.toString().replace("'", "`") + ' - ' + data[rec].storecity.toString() + ', ' + data[rec].storest + ' Store# ' + data[rec].storenumber + '  - Job# ' + jobnum.toString() + '\', \'' + data[rec].storezip.toString() + '\', \'' + data[rec].idx.toString() + '\')">'+ b1 +'</a>';
                        s += '<hr class="dropdown-divider">';
                    }
                }
                s += '<a type="button" style="min-width: 100%;" data-bs-toggle="tooltip" data-bs-placement="right" title="Get Schedule by Store #." class="dropdown-item" onclick="AddScheduleToStore(' + jobnum + ', ' + data[rec].idfjobstoresassigned.toString() + ',\'' + data[rec].storename.toString().replace("'", "`") + ' - ' + data[rec].storecity.toString() + ', ' + data[rec].storest + ' Store# ' + data[rec].storenumber + '  - Job# ' + jobnum.toString() + '\', \'' + data[rec].storezip.toString() + '\', \'' + data[rec].idx.toString() + '\')">' + b2 +'</a>';
                s += '<hr class="dropdown-divider">';
                if (data[rec].complete != 1 && data[rec].ispaid != 1) {
                    if (data[rec].totalexpectedhourswork >= 1) {
                        if (data[rec].IsSplit == "Y") {
                            s += '<a type="button" data-bs-toggle="tooltip" data-bs-placement="right" title="Edit Parent." class="dropdown-item" onclick="AddScheduleToStoreByIDxSplitParent(' + jobnum + ', ' + data[rec].idfjobstoresassigned.toString() + ',\'' + data[rec].storename.toString().replace("'", "`") + ' - ' + data[rec].storecity.toString() + ', ' + data[rec].storest + ' Store# ' + data[rec].storenumber + '  - Job# ' + jobnum.toString() + '\', \'' + data[rec].storezip.toString() + '\', \'' + data[rec].idx.toString() + '\')">' + b3 + '</a>';
                            s += '<hr class="dropdown-divider">';
                        }
                        else {
                            s += '<a type="button" data-bs-toggle="tooltip" data-bs-placement="right" title="Split this." class="dropdown-item" onclick="AddScheduleToStoreByIDxSplit(' + jobnum + ', ' + data[rec].idfjobstoresassigned.toString() + ',\'' + data[rec].storename.toString().replace("'", "`") + ' - ' + data[rec].storecity.toString() + ', ' + data[rec].storest + ' Store# ' + data[rec].storenumber + '  - Job# ' + jobnum.toString() + '\', \'' + data[rec].storezip.toString() + '\', ' + data[rec].idx.toString() + ',' + data[rec].idx.toString() + ')">' + b4 + '</a>';
                            s += '<hr class="dropdown-divider">';
                        }
                    }
                }

                if (data[rec].dateschedule != null) {
                    if (data[rec].complete != 1 && data[rec].ispaid != 1) {
                        s += '<a type="button" data-bs-toggle="tooltip" data-bs-placement="right" class="dropdown-item" title="Delete this event." href="javascript:;" onclick="deleteschedule(' + data[rec].idx.toString() + ', \'' + data[rec].dateschedule.toString() + '\')">' + b5 + '</a>';
                        s += '<hr class="dropdown-divider">';
                    }
                }

                if (data[rec].complete != 1 && data[rec].ispaid != 1) {
                    s += '<a type="button" data-bs-toggle="tooltip" data-bs-placement="right" title="Delete all events of this store." class="dropdown-item" onclick="deleteStoreFromJob(' + data[rec].idfjobstoresassigned.toString() + ',' + data[rec].jobnum.toString() + ',\'' + data[rec].storename.toString().replace("\'", '`') + ' (' + data[rec].storenumber.toString() + ')\'); return false;" href="javascript:void(0);">' + b6 + '</a>';                   
                }

                s += '</div></td>';
            }
            else if (teamlead) {

                s += '<td><a title="Get schedules by store number." class="dropdown-item" onclick="AddScheduleToStore(' + jobnum + ', ' + data[rec].idfjobstoresassigned.toString() + ',\'' + data[rec].storename.toString().replace("'", "`") + ' - ' + data[rec].storecity.toString() + ', ' + data[rec].storest + ' Store# ' + data[rec].storenumber + '  - Job# ' + jobnum.toString() + '\', \'' + data[rec].storezip.toString() + '\', \'' + data[rec].idx.toString() + '\')"><span style="font-size:12px;">' + data[rec].storenumber + '</span></a></td>';

            }
            else {
                s += '  <td>' + data[rec].storenumber + '</td>';
            }
            s += '</div>';  

            // storename 
            if (data[rec].parentIDx > 0) {
                s += '<td><div style="height:7px"></div><i class="bi bi-pie-chart-fill"></i>&nbsp;&nbsp;</i><a href="javascript:void(0);" onclick="showStoreSchedulesByStoreNumber(\'' + data[rec].storenumber.toString() + '\')" title="' + data[rec].storename.replace("'", "`") + '">' + data[rec].storename + '</a>';//showStoreSchedulesByStoreNumber
              }
            else {
                s += '  <td sorttable_customkey="' + data[rec].storename + data[rec].storecity + data[rec].employeefirstname + data[rec].employeelastname + data[rec].dateschedule + '"><div style="height:7px"></div><a href="javascript:void(0);" onclick="showStoreSchedulesByStoreNumber(\'' + data[rec].storenumber.toString() + '\')" title="' + data[rec].storename.replace("'", "`") + '">' + data[rec].storename + '</a></td>';//showStoreSchedulesByStoreNumber
            }
            // store state

            // store address
            s += '  <td sorttable_customkey="' + data[rec].storecity + data[rec].storeaddress + data[rec].employeefirstname + data[rec].employeelastname + data[rec].dateschedule + '">' + data[rec].storeaddress + '<br />' + data[rec].storecity + ', ' + data[rec].storest + ' ' + data[rec].storezip + '</td>';
            
            // Rep Name
            s += '  <td data-order="' + data[rec].employeelastname + '" id="tdstorescheduleRepIDX_' + data[rec].idx + '"><a href="javascript:void(0);" onclick="showEmployeeSchedules(\'' + data[rec].repnum + '\')" title="' + data[rec].note.replace("'", "`") + '">' + data[rec].employeefirstname + ' ' + data[rec].employeelastname + ' (' + data[rec].repnum + ')</a> ';

            if (data[rec].employeetypedesc != null) {
                s += data[rec].employeetypedesc.substring(1, 1);
            }

            // Date Schedule
            s += '  <td style="width:80px;" sorttable_customkey="' + data[rec].dateschedule + data[rec].expectedtimein + data[rec].employeefirstname + data[rec].employeelastname + data[rec].dateschedule + data[rec].storeaddress + '" id="tdstorescheduleDateIDX_' + data[rec].idx + '">' + formatjsondateMMDDYYYY(data[rec].dateschedule) + " " + data[rec].expectedtimein + '</td>';



            // Notify & Accept
            if (data[rec].repResponse == 1) {
                s += '  <td data-order="2"><button type="button" data-bs-toggle="tooltip" href="javascript:;" onclick="notifyrepbyidx(' + data[rec].jobnum + ',' + data[rec].repnum + ',' + data[rec].idx + '); return false;" title="Send ' + data[rec].employeefirstname.replace("'", "") + ' Notification" class="btn btn-success" style="color:white"><i class="bi bi-check-all"></i></button></td>';
            }
            else if (data[rec].isnotified == 1) {
                s += '  <td data-order="1"><button type="button" data-bs-toggle="tooltip" href="javascript:;" onclick="notifyrepbyidx(' + data[rec].jobnum + ',' + data[rec].repnum + ',' + data[rec].idx + '); return false;" title="Send ' + data[rec].employeefirstname.replace("'", "") + ' Notification" class="btn btn-warning"><i class="bi bi-check-lg"></i></button></td>';
            }
            else {
                s += '  <td data-order="0"><button type="button" data-bs-toggle="tooltip" href="javascript:;" onclick="notifyrepbyidx(' + data[rec].jobnum + ',' + data[rec].repnum + ',' + data[rec].idx + '); return false;" title="Send ' + data[rec].employeefirstname.replace("'", "") + ' Notification" class="btn btn-warning"><i class="bi bi-exclamation-triangle-fill"></i></button></td>';
            }

            var d = new Date();
            d.setDate(d.getUTCDate() - 1);
            //ExpectedWorkHours
            var dTimeIn = new Date(returnMMDDYYHHMM(this.timein));
            var dTimeOut = new Date(returnMMDDYYHHMM(this.timeout));

            var timelapse = dTimeOut.getTime() - dTimeIn.getTime();
            var daysDifference = Math.floor(timelapse / 1000 / 60 / 60 / 24);
            timelapse -= daysDifference * 1000 * 60 * 60 * 24

            var hoursDifference = Math.floor(timelapse / 1000 / 60 / 60);
            timelapse -= hoursDifference * 1000 * 60 * 60

            var minutesDifference = Math.floor(timelapse / 1000 / 60);
            timelapse -= minutesDifference * 1000 * 60

            var tmpTimeLapse = (hoursDifference * 60) + minutesDifference
            var redflag = '<span style="color:Black;">';
            var redflagEnd = '</span>';

            if (data[rec].totalexpectedhourswork != null) {
                if (data[rec].totalexpectedhourswork > 0) {
                    var j = (tmpTimeLapse - (data[rec].totalexpectedhourswork * 60)) / (data[rec].totalexpectedhourswork * 60);

                    if (j > .25) {
                        redflag = '<a href="#" onclick="return false;" data-bs-toggle="tooltip" title="Expected work hours: ' + ((data[rec].totalexpectedhourswork * 100) / 100).toFixed(2).toString() + ' - Reported hours: ' + ((Math.round((tmpTimeLapse / 60) * 100)) / 100).toFixed(2).toString() + '"><span style="color:Red;">';
                        redflagEnd = '</span></a>';
                    }
                }
            }

            //time in
            if (new Date(formatjsondateMMDDYYYY(data[rec].dateschedule)) < d && data[rec].timein == null) {
                s += '  <td><button type="button" class="btn btn-warning"><i class="bi bi-exclamation-triangle-fill"></i></button></td>';
            }
            else if (data[rec].timein != null) {
                s += '  <td><div style="height:7px"></div>' + redflag + returnHHMM(data[rec].timein) + redflagEnd + '</td>';
            }
            else {
                s += '  <td><div style="height:7px"></div>-</td>';
            }
            //time out
            if (new Date(formatjsondateMMDDYYYY(data[rec].dateschedule)) < d && data[rec].timeout == null) {
                s += '  <td><button type="button" class="btn btn-warning"><i class="bi bi-exclamation-triangle-fill"></i></button></td>';
            }
            else if (data[rec].timeout != null) {
                s += '  <td><div style="height:7px"></div>' + redflag + returnHHMM(data[rec].timeout) + redflagEnd + '</td>';
            }
            else {
                s += '  <td><div style="height:7px"></div>-</td>';
            }
            //survey
            if (data[rec].surveyv == 1) {
                if (data[rec].countofanswers >= data[rec].countofquestions && data[rec].countofquestions > 0) {
                    s += '<td>' + '<button type="button" class="btn btn-success" id="alinkSchedule_' + data[rec].idx + '" data-bs-toggle="modal" data-bs-target="#divAnswerSurvey" onclick="getSurveyGroup(' + jobnum + ', ' + data[rec].idx + ',0,\'\'); $(\'#divAnswerSurvey\').css({\'display\' : \'block\'});" href="javascript:;"><a data-bs-toggle="tooltip" title="' + dTimeOut + '">' + data[rec].countofanswers + '/' + data[rec].countofquestions + '</a></button>';  //'<center><div class="checkicon" /></center></td>';
                }
                else {
                    s += '<td>' + '<button type="button" class="btn btn-warning" id="alinkSchedule_' + data[rec].idx + '" data-bs-toggle="modal" data-bs-target="#divAnswerSurvey" onclick="getSurveyGroup(' + jobnum + ', ' + data[rec].idx + ',0,\'\'); $(\'#divAnswerSurvey\').css({\'display\' : \'block\'});" href="javascript:;"><a data-bs-toggle="tooltip" title="Edit Survey">' + data[rec].countofanswers + '/' + data[rec].countofquestions + '</a></button>';
                }
            }
            else {
                s += '  <td><div style="height:7px"></div>N/A';
            }
            if (data[rec].photocount > 0) {
                s += '<center><a style="color:white" class="btn btn-success" href="javascript:;" onclick="openuploader(' + jobnum + ',' + data[rec].idx + '); return false;"><i class="bi bi-camera"></i></a></center>';
            }
            s += '</td>';

            /* photo
            if (data[rec].photocount > 0) {
                s += '<td><a style="color:white" class="btn btn-success" href="javascript:;" onclick="openuploader(' + jobnum + ',' + data[rec].idx + '); return false;"><i class="bi bi-camera"></i></a></td>';
            }
            else {
                s += '<td><a class="btn btn-warning" href="javascript:;" onclick="openuploader(' + jobnum + ',' + data[rec].idx + '); return false;"><i class="bi bi-camera"></i></a></td>';
            }
            */

            //mileage
            if (data[rec].billtype == 1) {//flatrate
                s += '  <td><div style="height:7px"></div>N/A</td>';
            }
            else if (data[rec].billtype == 2) {//hourly
                s += '  <td><div style="height:7px"></div>' + Math.round(data[rec].taskmileage, 1) + '</td>';
            }

            //AFP
            if (data[rec].complete == 1) {
                s += '  <td><button type="button" class="btn btn-success"><i class="bi bi-check-circle-fill"></i></button></td>';
            }
            else {
                if (data[rec].iscompletedbyrep == 1) {
                    s += '  <td sorttable_customkey="0' + data[rec].employeefirstname + data[rec].employeelastname + data[rec].storename + data[rec].storecity + '"><button type="button" class="btn btn-warning"><i class="bi bi-exclamation-triangle-fill"></i></button></td>';
                }
                else {
                    s += '  <td sorttable_customkey="-1' + data[rec].employeefirstname + data[rec].employeelastname + data[rec].storename + data[rec].storecity + '">-</td>';
                }
            }

            //ispaid
            if (data[rec].ispaid == 1) {
                s += '  <td><button type="button" data-bs-toggle="tooltip" title="PAID" class="btn btn-success">PAID</button><div style="height:15.59px"></td>';
            }
            else {
                s += '  <td>-</td>';
            }

            //invoiced
            if (data[rec].IID > 0) {
                s += '  <td><button type="button" class="btn btn-success"><i class="bi bi-check-circle-fill"></i></button></td>';
            }
            else {
                s += '  <td>-</td>';
            }
            
            /* REP COMMENT */
            if (data[rec].repcomment != "") {
                var _comment = data[rec].repcomment.toString();
                _comment = _comment.replace(/(\r\n|\n|\r)/gm, '<br />');
                _comment = _comment.replace(/(\'|\")/gm, '`');
                s += '  <td><button type="button" data-bs-toggle="tooltip" class="btn btn-primary" href="javascript:void(0)" onclick="showMessage(\'Rep comment: ' + _comment + '\'); return false;" title="Rep comment:' + data[rec].repcomment.replace('\'', '\\\'').replace('"', '\'') + '"><i class="bi bi-chat-dots-fill"></i></button></td>';
            }
            else {
                s += '  <td>-</td>';
            }

            /* Manager Note */
            if (data[rec].managernote != "") {
                var _managernote = data[rec].managernote.toString();
                _managernote = _managernote.replace(/(\r\n|\n|\r)/gm, '<br />');
                _managernote = _managernote.replace(/(\'|\")/gm, '`');
                if (_managernote.includes("GOOD"))
                    s += '  <td><button type="button" data-bs-toggle="tooltip" class="btn btn-success" href="javascript:void(0)" onclick="showMessage(\'Manager note: ' + _managernote + '\'); return false;" title="Manager note: ' + data[rec].managernote.replace('\'', '\\\'').replace('"', '\'') + '"><i class="bi bi-chat-left-fill"></i></button></td>';
                else
                    s += '  <td><button type="button" data-bs-toggle="tooltip" class="btn btn-warning" href="javascript:void(0)" onclick="showMessage(\'Manager note: ' + _managernote + '\'); return false;" title="Manager note: ' + data[rec].managernote.replace('\'', '\\\'').replace('"', '\'') + '"><i class="bi bi-chat-left-dots-fill"></i></button></td>';
            }
            else {
                s += '  <td>-</td>';
            }


            /* Admin Note */
            var distanceCheckOutFlag = 0;
            var distanceCheckInFlag = 0;

            if (data[rec].adminnote != "") {
                var _adminnote = data[rec].adminnote.toString();
                _adminnote = _adminnote.replace(/\r\n|\n|\r/gm, '<br />');
                _adminnote = _adminnote.replace(/\'|\"/gm, '`');

                s += '  <td><button type="button" data-bs-toggle="tooltip" class="btn btn-info" href="javascript:void(0)" onclick="showMessage(\'Admin note: ' + _adminnote + '\'); return false;" title="Admin note: ' + data[rec].adminnote.replace('\'', '\\\'').replace('"', '\'')

                if (typeof (data[rec].distanceCheckIn) !== "undefined" && data[rec].distanceCheckIn != null) {
                    if (parseFloat(data[rec].distanceCheckIn) > parseFloat(distanceTolerance)) {
                        distanceCheckInFlag = 1;
                    }
                }

                if (typeof (data[rec].distanceCheckOut) !== "undefined" && data[rec].distanceCheckOut != null) {
                    if (parseFloat(data[rec].distanceCheckOut) > parseFloat(distanceTolerance)) {
                        distanceCheckOutFlag = 1;
                    }
                }

                if (typeof (data[rec].distanceCheckIn) !== "undefined" && data[rec].distanceCheckIn != null) {
                    if (distanceCheckInFlag == 1 || distanceCheckOutFlag == 1) {
                        s += " Distance check-in: " + data[rec].distanceCheckIn + " ml";
                    }
                }
                if (typeof (data[rec].distanceCheckOut) !== "undefined" && data[rec].distanceCheckOut != null) {
                    if (distanceCheckInFlag == 1 || distanceCheckOutFlag == 1) {
                        s += " Distance check-out: " + data[rec].distanceCheckOut + " ml";
                    }
                }

                s += '"><i class="bi bi-chat-right-fill"></i></button></td>';
            }
            else {
                var _adminnote = "";
                if (typeof (data[rec].distanceCheckIn) !== "undefined" && data[rec].distanceCheckIn != null) {
                    if (parseFloat(data[rec].distanceCheckIn) > parseFloat(distanceTolerance)) {
                        distanceCheckInFlag = 1;
                    }
                }

                if (typeof (data[rec].distanceCheckOut) !== "undefined" && data[rec].distanceCheckOut != null) {
                    if (parseFloat(data[rec].distanceCheckOut) > parseFloat(distanceTolerance)) {
                        distanceCheckOutFlag = 1;
                    }
                }

                if (typeof (data[rec].distanceCheckIn) !== "undefined" && data[rec].distanceCheckIn != null) {
                    if (distanceCheckInFlag == 1 || distanceCheckOutFlag == 1) {
                        _adminnote += " Distance check-in: " + data[rec].distanceCheckIn + " ml";
                    }
                }
                if (typeof (data[rec].distanceCheckOut) !== "undefined" && data[rec].distanceCheckOut != null) {
                    if (distanceCheckInFlag == 1 || distanceCheckOutFlag == 1) {
                        _adminnote += " Distance check-out: " + data[rec].distanceCheckOut + " ml";
                    }
                }

                if (_adminnote != "") {
                    s += '  <td><button href="javascript:void(0)" title="Admin note: ' + _adminnote; // removed onclick="showMessage(\'Admin note: ' + _adminnote + '\'); return false;"
                    s += '"><i class="bi bi-chat-right-fill"></i></button></td>';
                }
                else {
                    s += '  <td>';
                    s += "-</td>";
                }
            }
            


            /* URGENT */
            var strUrgent = data[rec].Urgent;
            s += '  <td sorttable_customkey="0">';
            if (strUrgent !== '') {
                s += '  <button type="button" class="btn btn-danger" ';
                s += '  id="' + spanid + '"';
                s += '  data-bs-toggle="tooltip" data-bs-placement="bottom" title="';
                s += strUrgent; // issue text goes here
                s += '  "><i class="bi bi-flag"></i>';
                s += '  </button>';
            }
            else {
                s += '  -';
            }
            s += '</td>';

            // ID
            if (data[rec].parentIDx > 0) {
                s += '<td style="max-width:40px;">' + '<a type="button" style="color:blue" id="parentidx_' + data[rec].idx + '" class="" data-bs-toggle="tooltip" title="' + data[rec].parentIDx + '" onclick="setSearchbar(' + jobnum.toString() + ',' + data[rec].parentIDx + ')">' + data[rec].parentIDx + '</a> / ' + data[rec].idx + '</td></tr>';
            }
            else {
                if (data[rec].IsSplit == "Y") 
                {
                    s += '<td style="max-width:40px;">' + data[rec].parentIDx + ' / <a type="button" style="color:blue" id="parentidx_' + data[rec].idx + '" class="" data-bs-toggle="tooltip" title="' + data[rec].idx + '" onclick="setSearchbar(' + jobnum.toString() + ',' + data[rec].idx + ')">' + data[rec].idx + '</a></td></tr>';
                }
                else 
                {
                    s += '<td style="max-width:40px;">' + data[rec].parentIDx + ' / ' + data[rec].idx + '</td></tr>';
                }
            }
                       /* TYPE 
            s += '<td>';
            if (data[rec].IsSplit == "N") {
                if (data[rec].parentIDx.toString() == "0") {
                    s += 'REGULAR';
                }
                else { s += 'SPLIT'; }
            }
            else { s += 'PARENT'; }
            s += '</td></tr>';
            */
            var p_length;
            p_length = ((rec + 1) / data.length) * 100;
            $("#progressbar" + jobnum.toString()).css("width", p_length.toString() + "%");
            async: false;
        }); //<!--jQuery-->

        //s += "</tbody></table>";

    } //<!--if(data.length>0)-->
    s += '</tbody></table>';
    s += '</div>';

    $("#divJobAssn" + jobnum.toString()).html(s);
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    createDataTable(jobnum);
}

function reCalc(table) {
    table.DataTable().columns.adjust();
    table.DataTable().responsive.recalc();
}

function setSearchbar(jobnum, param) {
    $('#storesbyjobnum_' + jobnum).DataTable().search(param).draw();
}

function createDataTable(jobnum) {
    
    const table = new DataTable('#storesbyjobnum_' + jobnum.toString(), {
        dom: 'Bfrtip',
        //bLengthChange: true,
        order: [[1, 'asc']],
        lengthMenu: [[-1, 1000, 100, 10], ["ALL", 1000, 100, 10]],
        stateSave: false,
        stateSaveCallback: function (settings, data) {
            localStorage.setItem('DataTables_' + settings.sInstance, JSON.stringify(data))
        },
        stateLoadCallback: function (settings) {
            return JSON.parse(localStorage.getItem('DataTables_' + settings.sInstance))
        },
        colReorder: true,
        responsive: true,
        bFilter: true,
        bSort: true,
        scrollY: 600,
        bPaginate: true,
        bAutoWidth: false,
        columnDefs: [
            {
                'targets': "all",
                'className': 'dt-head-center'
            },
            {
                'type': 'string',
                'targets': [4, 15, 16],
            },
            {
                'type': 'html',
                'targets': 4,
            },
            { className: "td-text-center", targets: "_all" },
            { width: "40px", targets: [0, 6, 9, 11, 12, 13, 14, 15, 16, 17] },
            { width: "75px", targets: [1,] },
            { width: "60px", targets: [2, 3, 4] },
            { width: "50px", targets: [5, 7, 8] },
            { width: "20px", targets: [10] },
        ],
        buttons: ['pageLength', 'spacer', 'copyHtml5', 'spacer', 'excelHtml5', 'spacer', 'colvis', 'spacer', 'colvisRestore', 'spacer', 'createState', 'spacer',
            {
                extend: 'savedStates',
                config: {
                    remove: true
                }
                /*
                action: function (e, dt, node, config) {

                }
                */
            },
            'spacer',
            {
                text: 'Re-size',               
                action: function (e, dt, node, config) {
                    reCalc($('#storesbyjobnum_' + jobnum.toString()));
                    //$('#storesbyjobnum_' + jobnum.toString()).DataTable().ajax.reload();
                }              
            }
        ]
    });
}

function postStoresByJobnumClient(result, jobnum) {
    var data = result.d;
    var s = '<div class="span11" style="position:float; margin-left:auto; margin-right:auto; vertical-align:text-top;">';
    s += '<table id="storesbyjobnum_' + jobnum.toString() + '" class="clear table-bordered table-striped table-highlight sorttable" style="width:100%">';
    s += '<thead>';
    s += '  <tr>';
    s += '      <th class="sortfield" onclick="storeschedulecolumnsorted=1;">Store #</th>';
    s += '      <th class="sortfield" onclick="storeschedulecolumnsorted=2;">Store Name</th>';
    s += '      <th class="sortfield" onclick="storeschedulecolumnsorted=3;">Store Address</th>';
    s += '      <th class="sortfield" onclick="storeschedulecolumnsorted=4;">Rep Name</th>';
    s += '      <th class="sortfield" onclick="storeschedulecolumnsorted=5;">Date Schedule</th>';
    s += '      <th class="sortfield" onclick="storeschedulecolumnsorted=8;">Time In</th>';
    s += '      <th style="z-index:1" class="sortfield" onclick="storeschedulecolumnsorted=9;">Time Out</th><th class="sortfield">Survey</th>';
    s += '      <th class="sortfield" onclick="storeschedulecolumnsorted=10;">Photo</th>';
    s += '      <th colspan="3" class="sortfield" onclick="storeschedulecolumnsorted=13;"><div class="commentheader">Comment</div></th>';
    s += '  </tr>';
    s += '</thead>';
    s += '<tbody>';
    var currRow;

    if (data.length > 0) {
        jQuery.each(data, function (rec) {
            var spanid = jobnum.toString() + '_' + data[rec].storeid.toString();
            // <a id='lnkAddStore<%# Eval("jobnum").ToString() %>' onclick='getJobInfoToAddStore(<%# Eval("jobnum").ToString() %>)' class="btn btn-large btn-tertiary" data-toggle="modal" href="#divScheduler">Add Store</a>

            s += '<tr class="postStoresByJobnum_' + data[rec].idfjobstoresassigned + '" id="postStoresByJobnumIDX_' + data[rec].idx + '" onclick="colorparentchild(\'' + data[rec].IsSplit.trim() + '\', ' + data[rec].idx.toString() + ',' + data[rec].parentIDx.toString() + ',' + data[rec].jobnum.toString() + ');" IsParent="' + data[rec].IsSplit + '" IDx="' + data[rec].idx.toString() + '" ParentIDx="' + data[rec].parentIDx.toString() + '"  >';

            s += '  <td>'

            if (data[rec].complete != 1 && data[rec].ispaid != 1) {
				if (data[rec].totalexpectedhourswork >= 1) {
					if (data[rec].IsSplit == "Y") {
						s += '<a title="Parent" class="btn btn-mini" href="javascript:;"><image src="App_Themes/img/splitted.png" /></a>';
					}
				}
			}

			s += data[rec].storenumber + '</td>';

            if (data[rec].parentIDx > 0) {
                s += '  <td sorttable_customkey="' + data[rec].storename + data[rec].storecity + data[rec].employeefirstname + data[rec].employeelastname + data[rec].dateschedule + '"><img src="/app_themes/img/pie.png" />&nbsp;&nbsp;<a href="javascript:void(0);" title="' + data[rec].storename.replace("'", "`") + '">' + data[rec].storename + '</a></td>';
            }
            else {
                s += '  <td sorttable_customkey="' + data[rec].storename + data[rec].storecity + data[rec].employeefirstname + data[rec].employeelastname + data[rec].dateschedule + '"><a href="javascript:void(0);" title="' + data[rec].storename.replace("'", "`") + '">' + data[rec].storename + '</a></td>';
            }


            s += '  <td sorttable_customkey="' + data[rec].storecity + data[rec].storeaddress + data[rec].employeefirstname + data[rec].employeelastname + data[rec].dateschedule + '">' + data[rec].storeaddress + '<br />' + data[rec].storecity + ', ' + data[rec].storest + ' ' + data[rec].storezip + '</td>';
            s += '  <td sorttable_customkey="' + data[rec].employeefirstname + data[rec].employeelastname + data[rec].dateschedule + data[rec].storename + data[rec].storeaddress + '" id="tdstorescheduleRepIDX_' + data[rec].idx + '"><a href="javascript:void(0);" title="' + data[rec].note.replace("'", "`") + '">' + data[rec].employeefirstname + ' ' + data[rec].employeelastname + ' (' + data[rec].repnum + ')</a> ';

            s += '  <td style="width:80px;" sorttable_customkey="' + data[rec].dateschedule + data[rec].expectedtimein + data[rec].employeefirstname + data[rec].employeelastname + data[rec].dateschedule + data[rec].storeaddress + '" id="tdstorescheduleDateIDX_' + data[rec].idx + '">' + formatjsondateMMDDYYYY(data[rec].dateschedule) + " " + data[rec].expectedtimein + '</td>';

            var d = new Date();
            d.setDate(d.getUTCDate() - 1);
            //ExpectedWorkHours
            var dTimeIn = new Date(returnMMDDYYHHMM(this.timein));
            var dTimeOut = new Date(returnMMDDYYHHMM(this.timeout));

            var timelapse = dTimeOut.getTime() - dTimeIn.getTime();
            var daysDifference = Math.floor(timelapse / 1000 / 60 / 60 / 24);
            timelapse -= daysDifference * 1000 * 60 * 60 * 24

            var hoursDifference = Math.floor(timelapse / 1000 / 60 / 60);
            timelapse -= hoursDifference * 1000 * 60 * 60

            var minutesDifference = Math.floor(timelapse / 1000 / 60);
            timelapse -= minutesDifference * 1000 * 60

            var tmpTimeLapse = (hoursDifference * 60) + minutesDifference
            var redflag = '<span style="color:Black;">';
            var redflagEnd = '</span>';

            if (data[rec].totalexpectedhourswork != null) {
                if (data[rec].totalexpectedhourswork > 0) {
                    var j = (tmpTimeLapse - (data[rec].totalexpectedhourswork * 60)) / (data[rec].totalexpectedhourswork * 60);

                    if (j > .25) {
                        redflag = '<a href="#" onclick="return false;" title="Expected work hours: ' + ((data[rec].totalexpectedhourswork * 100) / 100).toFixed(2).toString() + ' - Reported hours: ' + ((Math.round((tmpTimeLapse / 60) * 100)) / 100).toFixed(2).toString() + '"><span style="color:Red;">';
                        redflagEnd = '</span></a>';
                    }
                }
            }

            //time in
            if (new Date(formatjsondateMMDDYYYY(data[rec].dateschedule)) < d && data[rec].timein == null) {
                s += '  <td><div class="warningstore" /></td>';
            }
            else if (data[rec].timein != null) {
                s += '  <td>' + redflag + returnHHMM(data[rec].timein) + redflagEnd + '</td>';
            }
            else {
                s += '  <td>-</td>';
            }

            //time out
            if (new Date(formatjsondateMMDDYYYY(data[rec].dateschedule)) < d && data[rec].timeout == null) {
                s += '  <td><div class="warningstore" /></td>';
            }
            else if (data[rec].timeout != null) {
                s += '  <td>' + redflag + returnHHMM(data[rec].timeout) + redflagEnd + '</td>';
            }
            else {
                s += '  <td>-</td>';
            }

            //survey
            var storeinfo = data[rec].storename + ' (' + data[rec].storenumber + ') \\r\\n' + data[rec].storeaddress + '\\r\\n' + data[rec].storecity + ', ' + data[rec].storest + ' ' + data[rec].storezip;

            if (data[rec].surveyv == 1) {
                if (data[rec].countofanswers >= data[rec].countofanswers && data[rec].countofanswers > 0) {
                    s += '<td sorttable_customkey="1' + data[rec].employeefirstname + data[rec].employeelastname + data[rec].storename + data[rec].storecity + '"><center>'
                    s +='<a id="alinkSchedule_' + data[rec].idx + '" href="javascript:void(0);" onclick="getSurveyGroup(' + jobnum + ', ' + data[rec].idx + ',0,\'' + storeinfo.replace("'","`") + '\'); $(\'#divAnswerSurvey\').css({\'display\' : \'block\'}); $(\'#divAnswerSurvey\').find(\'.btn-save\').css({\'display\' : \'none\'}); $(\'#divAnswerSurvey\').find(\'.QuestionsByJob\').css({\'max-width\' : \'580px\', \'width\' : \'580px\'}); $(\'#divAnswerSurvey\').find(\'.thAnswerSurvey_Question\').css({\'max-width\' : \'530px\', \'width\' : \'530px\'});"><div class="checkicon" /></a></center></td>';
                }
                else {
                    s += '<td sorttable_customkey="0' + data[rec].employeefirstname + data[rec].employeelastname + data[rec].storename + data[rec].storecity + '"><center>' + data[rec].countofanswers + '/' + data[rec].countofquestions + '</center></td>';
                }
            }
            else {
                s += '  <td sorttable_customkey="-1' + data[rec].employeefirstname + data[rec].employeelastname + data[rec].storename + data[rec].storecity + '"><center>N/A</center></td>';
            }

            //photo
            if (data[rec].photocount > 0) {
                s += '<td><center><a href="javascript:;" onclick="openPhotoViewer(' + jobnum + ',' + data[rec].idx + '); return false;"><div class="checkicon" /></a></center></td>';
            }
            else {
                s += '<td sorttable_customkey="0"></td>';
            }

            if (data[rec].repcomment != "") {
                var _comment = data[rec].repcomment.toString();
                _comment = _comment.replace(/(\r\n|\n|\r)/gm, '<br />');
                _comment = _comment.replace(/(\'|\")/gm, '`');
                s += '  <td sorttable_customkey="1"><center><a href="javascript:void(0)" onclick="showMessage(\'Rep comment: ' + _comment + '\'); return false;" title="Rep comment:' + data[rec].repcomment.replace('\'', '\\\'').replace('"', '\'') + '"><div class="commentrep" /></a></center></td>';
            }
            else {
                s += '  <td sorttable_customkey="0"><center>-</center></td>';
            }

            s += '</tr>';

            var p_length;
            p_length = ((rec + 1) / data.length) * 100;
            $("#progressbar" + jobnum.toString()).css("width", p_length.toString() + "%");
            async: false;
        });                                                                //<!--jQuery-->

        //s += "</tbody></table>";

    } //<!--if(data.length>0)-->
    s += '</tbody></table>';
    s += '</div>';
    $("#divJobAssn" + jobnum.toString()).html(s);

    sorttable.makeSortable(document.getElementById('storesbyjobnum_' + jobnum.toString()));

}

function colorparentchild(IsParent, IDx, ParentIDx, JobNum) {
    /*
    $('#storesbyjobnum_' + JobNum).attr("class", "table table-sm table-hover sorttable");

    $.when($('#storesbyjobnum_' + JobNum + ' > tbody > tr').each(function () {
        var currentRow = this;
        var tr_idx = currentRow.getAttribute("IDx");
        var tr_parentIDx = currentRow.getAttribute("parentIDx");
        var tr_isparent = currentRow.getAttribute("IsParent");

        $(currentRow).removeAttr("style");

    })).done(function () {

        $('#storesbyjobnum_' + JobNum + ' > tbody > tr').each(function () {
            var currentRow = this;
            var tr_idx = currentRow.getAttribute("IDx");
            var tr_parentIDx = currentRow.getAttribute("parentIDx");
            var tr_isparent = currentRow.getAttribute("IsParent");

            if (IsParent == "Y") {
                if (IDx == tr_idx) {
                    $('#storesbyjobnum_' + JobNum).attr("class", "table table-hover sorttable");
                    $(currentRow).attr("style", "background-color:#c9dce5;");
                }
            }

            if (tr_parentIDx == IDx) {
                $('#storesbyjobnum_' + JobNum).attr("class", "table table-hover sorttable");
                $(currentRow).attr("style", "background-color:#e3f0f7;");

            }
            //alert(tr_idx + "," + tr_parentIDx + "," + tr_isparent);
        });
    });   
        setFilter(JobNum);
    */
}

function getRoleValue() {
    var ret = 0;
    $.ajax({
        async: false,
        type: "POST",
        url: "forceoneData.asmx/GetRoleValue",
        data: "",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(data) {
            ret = data.d;
        },
        error: AjaxFailed
    });
    return ret;
}

function showProgressBar(bolShow, divname, progressbarname, speed) {
    if (bolShow == true) {
        $("#" + divname).show();
        $("#" + progressbarname).show();
        $("#" + progressbarname).css("width", "100%");
    }
    else {
        $("#" + progressbarname).hide(speed);
        $("#" + divname).hide(speed);
    }
}

function showMessage(msg) {

    $.msgbox(msg,
        {
            type: "info",
            buttons: [
                    { type: "submit", value: "Ok" }
            ]
        });

}

//used to delete a store associated with the job
//parameter idfJobStoresAssigned
function deleteStoreFromJob(idfJobStoresAssigned, jobnum, storename) {
    $.msgbox("Are you sure you want to delete " + storename.replace("\'", '`') + " from job number " + jobnum + "?<br />Deleting this store will also delete all associated schedules in the job.<br />Please be aware that you cannot delete a store if any of the scheduled event is already approved for payroll.<br />Please click Yes to confirm.", {
        type: "confirm",
        buttons: [
            { type: "submit", value: "Yes" },
            { type: "cancel", value: "Cancel" }
        ]
    }, function (result) {
        if (result) {
            $.ajax({
                type: "POST",
                url: "forceoneData.asmx/deleteStoreFromJob",
                beforeSend: function () {
                    //showProgressBar(true, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 0);
                },
                data: "{idfJobStoresAssigned: " + idfJobStoresAssigned.toString() + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    //repopulateJobInfo(jobnum);
                    //GetStoresByJobNum(jobnum);
                    $('.postStoresByJobnum_' + idfJobStoresAssigned).remove();
                    // movetodiv("divAccordionGroupHeader" + jobnum.toString());
                    //var cnt = data.d;
                    //$.msgbox(cnt + " record was deleted.", { type: "alert" });
                    //showProgressBar(false, "divprogress" + jobnum.toString(), "progressbar" + jobnum.toString(), 100);
                },
                error: AjaxFailed
            }); //ajax
        }   //end function
    });  //msgbox
}

//used to get the list of store by chain id
function getStoresByChain(id) {
    var rows = 0;

    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetStoresByChainIDCount",
        beforeSend: function () {
            showProgressBar(true, "divStoreSearch", "divStoreSearchProgressBar", 0);
        },
        data: "{ChainID: " + id.toString() + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var d = data.d;
            rows = d;
        },
        async: false,
        error: AjaxFailed
    });

    var fval = rows / 100;
    var pagenumber = Math.ceil(fval);

    //clear out store list
    $('#drpListOfStoresByChainId').empty();

    for (var i = 1; i <= pagenumber; i++) {
        $.ajax({
            type: "POST",
            url: "forceoneData.asmx/GetStoresByChainID",
            beforeSend: function () {
                showProgressBar(true, "divStoreSearch", "divStoreSearchProgressBar", 0);
            },
            data: "{ChainID: " + id.toString() + ", PageNumber: " + i + "}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                populateStoresbyChain(data, id, i);
                showProgressBar(false, "divStoreSearch", "divStoreSearchProgressBar", 500);
            },
            async: false,
            error: AjaxFailed
        });
    }
}

//After user click on the chain -
//query the list of stores that belongs to the chain
function postSelectionFromFilterList(id, txt) {
    $("#txtChainFilter").val(txt);
    getStoresByChain(id);

    $("#divListOfStoresByChainId").css("display", "block");
    $("#divListOfChains").css("display", "none");
}

//post the result to the page
function populateStoresbyChain(result, chainid, pagenumber) {
    var data = result.d;

    if (data.length > 0) {
        var s = "";
        if (data.length == 1 && pagenumber == 1) {
            getStoresByStoreID(data[0].StoreID.toString());
        }
        else {
            jQuery.each(data, function (rec) {
                s += '<li><a href="javascript:;" onclick="getStoresByStoreID(' + data[rec].StoreID.toString() + '); return false;">(' + data[rec].StoreNumber.toString() + ') ' + data[rec].Address1.replace("\'", '`').toString() + ' ' + data[rec].City.replace("\'", '`').toString() + ', ' + data[rec].ST.replace("\'", '`').toString() + ' ' + data[rec].Zip.replace("\'", '`').toString() + '</a></li>'
            });

            $('#drpListOfStoresByChainId').append(s)
            $("#divListOfStoresByChainId").css("display", "block");
            $("#divListOfChains").css("display", "none");
        }
    };
}

//used to get the list of store by chain id
function getStoresByStoreID(id) {
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetStoreByStoreID",
        data: "{StoreID: " + id.toString() + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populateStoreInfo(data, id);
        },
        error: AjaxFailed
    });
}

//Used to populate the store selection to add to the job
function populateStoreInfo(result) {
    var data = result.d;

    $("#txtStoreID").val(data.StoreID.toString());
    $("#txtStoreNumber").val(data.StoreNumber.toString());
    $("#txtStoreName").val(data.StoreName);
    $("#txtStoreAddr1").val(data.Address1);
    $("#txtStoreAddr2").val(data.address2);
    $("#txtStoreCity").val(data.City);
    $("#txtStoreST").val(data.ST);
    $("#txtStoreZip").val(data.Zip);

    $("#divListOfStoresByChainId").css("display", "none");
    $("#divListOfChains").css("display", "none");
}

function addStoreToJob() {
    var StoreID = $("#txtStoreID").attr("value");
    //alert(StoreID);
    //alert(currentjobnum);
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/AddStoreToJob",
        data: "{jobnum: " + currentjobnum.toString() + ", StoreID: " + StoreID + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var d;
            d = data.d;
            if (d.RowsAffected == 1) {
                repopulateJobInfo(currentjobnum);
                GetStoresByJobNum(currentjobnum);

                movetodiv("divAccordionGroupHeader" + currentjobnum);
                $.msgbox("The store id " + StoreID + " was successfully added to job number " + currentjobnum + ".<br />Click close when finish.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
            }
            else if (d.RowsAffected == -100) {
                $.msgbox("The store id " + StoreID + " for job number " + currentjobnum + " is already in the system.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
            }
            else if (d.RowsAffected == -101) {
                $.msgbox("Sorry, the job number " + currentjobnum + " is not in the system.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
            }
            else if (d.RowsAffected == -102) {
                $.msgbox("Sorry, the store id " + StoreID + " is not in the system.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
            }
            else {
                $.msgbox("oops, the system was not able to add store id " + StoreID + " to job number " + currentjobnum + " due to an internal error.", { type: "error", buttons: [{ type: "submit", value: "OK" }] });
            }
        },
        error: AjaxFailed
    });
}

function updateJob() {
    var err = 0;
    var msg = "";

    if ($("#txtjobname").attr("value") == "") {
        msg += "Please enter a job name before submitting.<br />";
        err++;
    }

    if ($("#" + $("#inputjobtype").attr("value") + " option:selected").attr("value") == "0") {
        msg += "Job type is required.<br />";
        err++;
    }

    if ($("#" + $("#inputacctexec").attr("value") + " option:selected").attr("value") == "0") {
        msg += "Account exec is required.<br />";
        err++;
    }

    if ($("#txtClientNum").attr("value") == "") {
        msg += "Please pick a client for the job.<br />";
        err++;
    }

    if ($("#txtbillingrate").attr("value") == "") {
        msg += "Billing rate must be entered.<br />";
        err++;
    }

    if (!validateCurrency($("#txtbillingrate").attr("value"))) {
        msg += "Billing rate is not a valid amount.<br />";
        err++;
    }

    if ($("#txtstartdate").attr("value") == "") {
        msg += "Job must have start date.<br />";
        err++;
    }

    if ($("#txtenddate").attr("value") == "") {
        msg += "Job must have end date.<br />";
        err++;
    }

    if (Date.parse($("#txtstartdate").attr("value")) > Date.parse($("#txtenddate").attr("value"))) {
        msg += "Job end date must be higher than the start date.<br />";
        err++;
    }

    var x = $("#" + $("#inputradbutton").val() + " input:checked").attr("value");

    if (x == undefined) {
        msg += "Please select if a survey is required for this project.<br />";
        err++;
    }
    else if (x == 'true') {
        if ($("#" + $("#inputtemplate").attr("value") + " option:selected").attr("value") == "0") {
            msg += "Job must have a template assigned if there is a survey.<br />";
            err++;
        }
    }

    if (err > 0) {
        $.msgbox("Please fix the following error(s) before saving.<br />" + msg, { type: "error", buttons: [{ type: "submit", value: "OK" }] });
        return;
    }

    var StoreID = $("#txtStoreID").attr("value");
    var par = "{jobnum: "
    par += $("#jobupdate_jobnum").attr("value") + ", ";
    par += "jobdesc: '" + Base64.encode($("#txtjobname").attr("value")) + "', ";
    par += "clientnum: " + $("#txtClientNum").attr("value") + ",";
    par += "jobtypenum: " + $("#" + $("#inputjobtype").attr("value") + " option:selected").attr("value") + ", ";
    par += "acctexecnum: " + $("#" + $("#inputacctexec").attr("value") + " option:selected").attr("value") + ", ";
    if ($("#" + $("#inputteamlead").attr("value") + " option:selected").attr("value") != undefined) {
        par += "teamleaduserid: " + $("#" + $("#inputteamlead").attr("value") + " option:selected").attr("value") + ", ";
    }
    else {
        par += "teamleaduserid: " + null + ", ";
    }
    par += "startdate: '" + $("#txtstartdate").attr("value") + "',";
    par += "enddate:'" + $("#txtenddate").attr("value") + "', ";
    par += "status: '', ";
    par += "billrate: " + $("#txtbillingrate").attr("value") + ", ";
    par += "survey: " + $("#" + $("#inputradbutton").val() + " input:checked").attr("value") + ", ";
    if (x == 'true') {
        par += "templatenum: " + $("#" + $("#inputtemplate").attr("value") + " option:selected").attr("value") + ", ";
    }
    else {
        par += "templatenum: " + null + ", ";
    }
    par += "complete: '" + $("#txtcomplete").attr("value") + "', ";
    par += "billtype: " + $("#" + $("#inputbilltype").attr("value") + " option:selected").attr("value") + ", ";
    par += "dutylevel: " + $("#" + $("#inputdutylevel").attr("value") + " option:selected").attr("value") + ", ";

    par += "billmileagecost: " + $("#txtbillmileagecost").attr("value") + ", ";
    par += "payrollmileagecost: " + $("#txtpayrollmileagecost").attr("value") + ", ";
    par += "expectedworkhours: " + $("#" + $("#inputexpectedworkhours").attr("value") + " option:selected").attr("value") + ",";
    par += "mileagetype: " + $("#" + $("#inputmileagetype").attr("value") + " option:selected").attr("value") + ", ";
    par += "managercomment: '" + Base64.encode($("#txtJobInfoManagerComment").attr("value")) + "', ";
    //$("#yourdropdownid option:selected").text();
    if ($("#selMainContact option:selected").val() != null) {
        par += "maincontactid: " + $("#selMainContact option:selected").val() + ", ";
    }
    else {
        par += "maincontactid: 0, ";
    }

    if ($("#selSecondContact option:selected").val() != null) {
        par += "secondcontactid: " + $("#selSecondContact option:selected").val() + ", ";
    }
    else {
        par += "selSecondContact: 0, ";
    }

    if ($("#selBillingContact option:selected").val() != null) {
        par += "billingcontactid: " + $("#selBillingContact option:selected").val();
    }
    else {
        par += "billingcontactid: 0";
    }

    par += "}";

    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/updateJob",
        data: par,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.d == 1) {
                $.msgbox("The job was updated successfully.", { type: "alert", buttons: [{ type: "submit", value: "OK" }] });
                //repopulateJobInfo($("#jobupdate_jobnum").attr("value"));
            }
            else if (data.d > 1) {
                //$.msgbox("The job '" + $("#txtjobname").attr("value") + "' was successfully added.", { type: "info" });
                $("jobupdate_jobnum").val(data.d);
                window.location.replace("jobentry.aspx");
                //appendNewJob(data.d);
            }
        },
        error: function (error) {
            console.log('Error ${error}');//AjaxFailed
        }
    });
}

function appendNewJob(newjobnum) {
    var newjob = '<div id="divAccordionGroup' + newjob + '" class="accordion-group">';
    newjob += '      <h4 jobnum="' + newjobnum + '" class="accordion-heading ui-accordion-header ui-helper-reset ui-corner-all ui-accordion-icons" role="tab" id="ui-accordion-divJobsAccordion-header-5" aria-controls="divJobDetail' + newjobnum + '" aria-selected="false" tabindex="-1"><span class="ui-accordion-header-icon ui-icon ui-icon-triangle-1-e"></span>';
    newjob += '     <div id="divAccordionHeader' + newjobnum + '" jobnum="' + newjobnum + '" style="min-height:110px;">';
    newjob += '            <div class="span2">';
    newjob += '                ' + newjobnum + '<div style="visibility: visible;" id="warning_jobnum_' + newjobnum + '"><img alt="Job requires attention" src="App_Themes/img/warning.png"></div>';
    newjob += '            </div>';
    newjob += '            <div class="span6">';
    newjob += '                ' + $("#txtjobname").attr("value");
    newjob += '                <div class="span4">';
    newjob += '               Store Count: <span id="spanJobID_StoreCount_' + newjobnum + '">0</span><br>';
    newjob += '                Stores with no schedules: <span id="spanJobID_CountOfStoresNoSchedule_' + newjobnum + '" style="color: rgb(255, 0, 0);">0</span><br>';
    newjob += '                Total count of schedules: <span id="spanJobID_TotalCountOfSchedules_' + newjobnum + '">0</span>';
    newjob += '                </div>';
    newjob += '                <div id="divprogress' + newjobnum + '" class="progress progress-secondary active" style="display:none; background-color:#8ab15a">';
    newjob += '					<div id="progressbar' + newjobnum + '" class="bar" style="width: 30%; background-color:#8ab15a"><img src="App_Themes/img/ajax-loader.gif" alt="fetching...">fetching...</div>';
    newjob += '					</div>';
    newjob += '                </div>';
    newjob += '                <div class="span3" style=" min-height:100px; max-height:100px">';
    newjob += '                    <div style="max-height: 80px; width: 80px; height: 80px;" id="divcirque_' + newjobnum + '" class="ui-cirque cirque-container" data-value="0" data-arc-color="#2790B0" data-radius="40"><canvas width="80" height="80" class="cirque-fill"></canvas><canvas width="80" height="80" class="cirque-track"></canvas><div class="cirque-label percent" style="width: 80px; height: 80px; color:white; line-height: 80px;">0%</div></div><br><span id="jobinfo_completed_' + newjobnum + '">0</span>/<span id="jobinfo_TotalCountOfSchedules_' + newjobnum + '">3</span>   <span id="jobinfo_remainingtask_' + newjobnum + '" style="color:red;"> (3) </span>  // <span id="jobinfo_pctComplete_' + newjobnum + '" style="color:green;">0% </span>  -- <span style="color:blue;">AFP 0</span><br>';
    newjob += '                </div> ';
    newjob += '            </div>';
    newjob += '        </h4>';
    newjob += '        <div id="divJobDetail' + newjobnum + '" class="ui-accordion-content ui-helper-reset ui-widget-content ui-corner-bottom" aria-labelledby="ui-accordion-divJobsAccordion-header-5" role="tabpanel" aria-expanded="false" aria-hidden="true" style="display: none;">';
    newjob += '            <div id="accordion_inner' + newjobnum + '" class="accordion-inner">  ';
    newjob += '                <div class="span4">';
    newjob += '                    <div id="divActionsJob' + newjobnum + '" style="text-align:center; display:none;">';
    newjob += '                        <div class="span1">';
    // Button Change from pictures
    newjob += '                            <a id="lnkAddStore' + newjobnum + '" onclick="getJobInfoToAddStore(' + newjobnum + ')" data-bs-toggle="modal" data-bs-target="#divStoreAdd"><img id="ctl00_placeholderBody_rptJobInfo_ctl05_imgAddStore' + newjobnum + '" src="App_Themes/img/plus.png" alt="Add Store" style="border-width:0px;"></a>';
    newjob += '                        </div>';
    newjob += '                        <div id="ctl00_placeholderBody_rptJobInfo_ctl05_divApproval' + newjobnum + '" class="span1">';
    newjob += '                            <a id="linkApprove' + newjobnum + '" onclick="getSchedulesByJobnum(' + newjobnum + ');" data-bs-toggle="modal" data-bs-target="#divApproval"><img id="ctl00_placeholderBody_rptJobInfo_ctl05_imgApprove' + newjobnum + '" src="App_Themes/img/check_mark.png" alt="Approve" style="border-width:0px;"></a>';
    newjob += '                        </div>';
    newjob += '                        <div class="span1">';
    newjob += '                            <a id="lnkEditJob' + newjobnum + '" onclick="getjobbyjobnum(' + newjobnum + ')" data-bs-toggle="modal" data-bs-target="#divJobInfo"><img id="ctl00_placeholderBody_rptJobInfo_ctl05_imgEditJob' + newjobnum + '" src="App_Themes/img/notes_edit.png" alt="Edit Job Info" style="border-width:0px;"></a>';
    newjob += '                        </div>';
    newjob += '                    </div>';
    newjob += '                </div>';
    newjob += '                <div id="divJobAssn' + newjobnum + '" class="span11" style="height:auto;">';
    newjob += '                </div>';
    newjob += '            </div>';
    newjob += '        </div>';
    newjob += '    </div>';

    $("#divJobsAccordion").html($("#divJobsAccordion").html() + newjob);
    bindAccordion();
}

function showEmployeeNotes(repnum, repname) {
    $("#divEmployeeNotes").css({ "display": "block" })

    $("#floatingdivbodyNote").html("");
    $("#floatingtitleNote").text(toProperCase(repname) + " (" + repnum + ")");
    var s = '';

    s = '<div id="divEmployeeNoteAddButton" style="text-align:right;"><button type="button" class="btn btn-info" onclick="showAddEmployeeNote(); return false;" href="#"><i style="width:30px; height:30px" class="bi bi-person-plus"></i></button></div>';
    s += '  <div id="divEmployeeNoteAdd" style="display:none; text-align:right; width:100%;">';
    s += '      <textarea id="txtEmployeeNoteAdd" placeholder="Enter your employee note(s) and click the save button." class="form-control"></textarea><hr>';
    s += '      <button type="button" class="btn btn-success" data-bs-toggle="tooltip" onclick="saveEmployeeNote(' + repnum + ', \'' + repname.replace("'", "`") + '\');" title="Save">Save</button>';
    s += '      <button type="button" class="btn btn-danger" data-bs-toggle="tooltip" onclick="cancelAddEmployeeNote();" title="Cancel">Cancel</button>';
    s += '  </div><hr>';
    s += '  <div id="divEmployeeNotesTable"></div>';

    $("#floatingdivbodyNote").html(s);
    populateEmployeeNotes(repnum, repname);
}

function populateEmployeeNotes(repnum, repname) {
    s = '<table id="tblEmployeeNotes" class="table table-bordered sorttable " style="color:#2A4480;vertical-alignment:top; max-height:350px;max-width:680px;"><thead>';
    s += '<tr><th class="sortfield">Entered By</th><th class="sortfield">Date Entered</th><th class="sortfield">Note</th><th class="sortfield"></th></tr></thead><tbody>';

    $.ajax({
        type: "POST",
        async: false,
        url: "forceoneData.asmx/GetEmployeeNotes",
        data: "{repnum: " + repnum + "}",
        beforeSend: function () {
            $("#divLoader").css({ "display": "block" });
        },
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {

            if (data.d.length > 0) {

                jQuery.each(data.d, function (rec) {
                    s += '<tr id="trNote_' + this.idfEmployeeNoteID + '">';
                    s += '<td sorttable_customkey="' + this.idfEmployeeNoteID + '">' + formatjsondateMMDDYYYY(this.datecreated) + '</td>';
                    s += '<td sorttable_customkey="' + this.enteredby + '">' + this.enteredby + '</td>';
                    s += '<td>';
                    s += '  <div id="divEmployeeNoteView_' + this.idfEmployeeNoteID + '">' + this.note.replace("'", "`") + '</div>';
                    s += '  <div style="display:none;" id="divEmployeeNoteEdit_' + this.idfEmployeeNoteID + '">';
                    s += '      <textarea class="form-control" style="width: 340px;" id="txtEmployeeNoteEdit_' + this.idfEmployeeNoteID + '" rows="5" cols="70">' + this.note.replace("'", "`") + '</textarea><br />';
                    s += '  <div class="btn-group" style="float:right">';
                    s += '      <button data-bs-toggle="tooltip" type="button" class="btn btn-success" onclick="updateEmployeeNote(' + repnum + ', \'' + repname.replace("'", "`") + '\', ' + this.idfEmployeeNoteID + ');" title="Save">Save</button>';
                    s += '      <button data-bs-toggle="tooltip" type="button" class="btn btn-danger" onclick="cancelUpdateEmployeeNote(' + this.idfEmployeeNoteID + ');" title="Cancel">Cancel</button>';
                    s += '  </div></div>';
                    s += '</td>';
                    s += '<td sorttable_customkey="' + formatjsondateMMDDYYYY(this.datecreated) + '"><button type="button" data-bs-toggle="tooltip" class="btn btn-outline-danger" onclick="deletenote(' + this.idfEmployeeNoteID + ',' + repnum + ',\'' + repname + '\');" title="Delete"><i class="bi bi-trash"></i></button><button data-bs-toggle="tooltip" type="button" class="btn btn-outline-purple" onclick="editEmployeeNote(' + this.idfEmployeeNoteID + ');" title="Edit"><i class="bi bi-pencil-square"></i></button></td>';
                    s += '</tr>'
                });

            };

            $("#divLoader").css({ "display": "none" });
        },
        error: AjaxFailed
    });            //end update

    s += '</tbody></table>';

    $("#divEmployeeNotesTable").html(s);
    sorttable.makeSortable(document.getElementById("tblEmployeeNotes"));
}

function showAddEmployeeNote() {
    toggleDiv("divEmployeeNoteAddButton", false, null);
    toggleDiv("divEmployeeNoteAdd", true, null);
}

function disableScroll() {
    // Get the current page scroll position
    scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
    scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft,

        // if any scroll is attempted,
        // set this to the previous value
        window.onscroll = function () {
            window.scrollTo(scrollLeft, scrollTop);
        };
}

function enableScroll() {
    window.onscroll = function () { };
}

function saveEmployeeNote(repnum, repname) {
    var note = $("#txtEmployeeNoteAdd").val();
    if (note == "") {
        alert("Please enter a note before saving.");
        return false;
    }

    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/AddEmployeeNote",
        data: "{repnum: '" + repnum + "', note: '" + Base64.encode(note) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.d == 1) {
                populateEmployeeNotes(repnum, repname);
            }
            else {
                $.msgbox("An error has occured saving the note.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
            }
        },
        error: AjaxFailed
    });   //end update /ajax

    toggleDiv("divEmployeeNoteAddButton", true, null);
    toggleDiv("divEmployeeNoteAdd", false, null);
}

function updateEmployeeNote(repnum, repname, employeenoteid) {
    var note = $("#txtEmployeeNoteEdit_" + employeenoteid).val();
    if (note == "") {
        alert("Please enter a note before saving.");
        return false;
    }

    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/UpdateEmployeeNote",
        data: "{idfEmployeeNoteID: '" + employeenoteid + "', note: '" + Base64.encode(note.replace("`", "'")) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.d == 1) {
                populateEmployeeNotes(repnum, repname);
            }
            else {
                $.msgbox("An error has occured saving the note.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
            }
        },
        error: AjaxFailed
    });   //end update /ajax

    toggleDiv("divEmployeeNoteView_" + employeenoteid, true, null);
    toggleDiv("divEmployeeNoteEdit_" + employeenoteid, false, null);
}

function cancelUpdateEmployeeNote(employeenoteid) {
    toggleDiv("divEmployeeNoteView_" + employeenoteid, true, null);
    toggleDiv("divEmployeeNoteEdit_" + employeenoteid, false, null);
}

function cancelAddEmployeeNote() {
    $("#txtEmployeeNoteAdd").val('');
    toggleDiv("divEmployeeNoteAddButton", true, null);
    toggleDiv("divEmployeeNoteAdd", false, null);
}

function deletenote(id, repnum, repname) {
    $.msgbox("You are about to delete this note.", {
        type: "confirm",
        buttons: [
            { type: "submit", value: "Continue" },
            { type: "cancel", value: "Cancel" }
        ]
    }, function (result) {
        if (result) {
            //string RepCell, int RepNum, string ContactPhoneProvider, string Subject, string TextBody
            $.ajax({
                type: "POST",
                url: "forceoneData.asmx/DeleteEmployeeNote",
                data: "{idfEmployeeNoteID: " + id + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.d == 1) {
                        $("#trNote_" + id).remove();
                    }
                    else {
                        $.msgbox("An error has occured deleting the note.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                    }
                },
                error: AjaxFailed
            });   //end update /ajax
        }
    });
}

function editEmployeeNote(employeenoteid) {
    toggleDiv("divEmployeeNoteView_" + employeenoteid, false, null);
    toggleDiv("divEmployeeNoteEdit_" + employeenoteid, true, null);
}

function getImportError() {
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetImportError",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            (data, jobnum)
        },
        error: AjaxFailed
    }); //end update
}

function getImportErrorByJobNum(jobnum) {
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetImportErrorByJobNum",
        data: "{JobNum: " + jobnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populateImportError(data, jobnum)
        },
        error: AjaxFailed
    }); //end update
}

function getInvoicesByJobNum(jobnum) {
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetInvoicesByJobNum",
        data: "{JobNum: " + jobnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            populateInvoices(data, jobnum)
        },
        error: AjaxFailed
    }); //end update
}

function populateImportError(data, jobnum) {
    $('#tblImportError > tbody').empty();

    var d = data.d;

    if (d.length == 0) {
        $('#divImportError_Header').text('No Import Error');

        if (jobnum > 0) {
            $('#tblImportError > tbody:last').append("<tr><td colspan='12>No Import Error for Job #" + jobnum + "</td></tr>");
        }
        else {
            $('#tblImportError > tbody:last').append("<tr><td colspan='12>No Import Error for Job #" + jobnum + "</td></tr>");
        }
    }
    else {
        if (jobnum > 0) {
            $("#divImportError_Header").text("Import error for job# [" + jobnum + "]");
        }
        else {
            $("#divImportError_Header").text(this.JobDesc.toString().replace(/(\'|\")/gm, '`') + "  [" + jobnum + "]");
        }

        jQuery.each(d, function (id) {
            s = "";
            s += '<tr id="importerrorrow_' + this.ImportErrorID.toString() + '">';
            s += '  <td sorttable_customkey="' + formatjsondateMMDDYYYY(this.dateimported.toString()) + "-" + this.dateimported.toString() + '">' + formatjsondateMMDDYYYY(this.dateimported.toString()) + '</td>';
            s += '  <td sorttable_customkey="' + this.filename + "-" + this.dateimported.toString() + '">' + this.filename + '</td>';
            s += '  <td sorttable_customkey="' + this.trucknumber + "-" + this.stopnumber.toString() + '">' + this.trucknumber + '</td>';
            s += '  <td sorttable_customkey="' + this.stopnumber + "-" + '">' + this.stopnumber + '</td>';
            s += '  <td sorttable_customkey="' + this.clientname + "-" + this.trucknumber.toString() + this.stopnumber + '">' + this.clientname + '</td>';
            s += '  <td sorttable_customkey="' + this.storename + "-" + this.trucknumber.toString() + this.stopnumber + '">' + this.storename + '</td>';
            s += '  <td sorttable_customkey="' + this.storenumber + "-" + this.trucknumber.toString() + this.stopnumber + '">' + this.storenumber + '</td>';
            s += '  <td sorttable_customkey="' + this.storeaddress + "-" + this.trucknumber.toString() + this.stopnumber + '">' + this.storeaddress + '</td>';
            s += '  <td sorttable_customkey="' + this.storecity + "-" + this.trucknumber.toString() + this.stopnumber + '">' + this.storecity + '</td>';
            s += '  <td sorttable_customkey="' + this.storest + "-" + this.trucknumber.toString() + this.stopnumber + '">' + this.storest + '</td>';
            s += '  <td sorttable_customkey="' + this.storezip + "-" + this.trucknumber.toString() + this.stopnumber + '">' + this.storezip + '</td>';
            s += '  <td sorttable_customkey="' + this.comment + "-" + this.trucknumber.toString() + this.stopnumber + '">' + this.comment + '</td>';
            s += '</tr>';
            $('#tblImportError > tbody:last').append(s);
        });
    }
    $("#divImportError").css({ "display": "block" });
}

function populateInvoices(data, jobnum) {
    $('#tblInvoices > tbody').empty();

    var d = data.d;

    if (d.length == 0) {
        $("#divInvoiceList_Header").text("No Job Invoice To Display");
        $('#tblInvoices > tbody:last').append("<tr><td colspan='4'>No Invoice to Display</td></tr>");
    }
    else {
        jQuery.each(d, function (id) {
            $("#divInvoiceList_Header").text(this.JobDesc.toString().replace(/(\'|\")/gm, '`') + "  [" + this.Jobnum + "]");
            s = "";
            s += '<tr id="invoicerow_' + this.IID.toString() + '">';

            var v = "";
            if (this.Voided == true)
            { v = 'Yes'; }
            else { v = 'No'; }

            //s += '  <td id="IDx"><input type="hidden" id="approval_IDx_' + this.idx.toString() + '" value = ' + this.idx.toString() + ' />' + this.idx.toString() + '</td>';
            s += '  <td style="max-width:130px;" id="invoiceiid_' + this.IID.toString() + '"><a href="Invoice.aspx?IID=' + d[id].IID.toString() + '" target = "_blank">' + d[id].IID.toString() + '</a></td>';
            s += '  <td style="max-width:130px;" id="invoicedatecreated_' + this.IID.toString() + '">' + formatjsondateMMDDYYYY(this.DateCreated) + '</td>';
            s += '  <td id="invoicejob_' + this.IID.toString() + '">' + this.JobDesc.toString().replace(/(\'|\")/gm, '`') + "[" + this.Jobnum.toString() + ']</td>';
            s += '  <td style="max-width:70px;" id="invoicevoid_' + this.IID.toString() + '"><div id="divinvoicevoid_' + this.IID.toString() + '">' + v + '</div></td>';

            if (this.Voided == false) {
                s += '  <td style="max-width:50px;" id="invoicevoidfunc_' + this.IID.toString() + '"><a id="lnkVoidInvoice_' + this.IID.toString() + '" class="link" href="javascript:;" onclick="voidInvoice(' + this.IID.toString() + '); return false;">Void</a></td>';
            }
            else {
                s += '  <td style="max-width:50px;" id="invoicevoidfunc_' + this.IID.toString() + '">-</td>';
            }

            s += '</tr>';
            $('#tblInvoices > tbody:last').append(s);
        });
    }
    $('#tblInvoices > tbody:last').append("<tr><td colspan='4'><a href='createinvoice.aspx?jobnum=" + jobnum + "' target='_blank'>Create Invoice</a></td></tr>");

}

function sortTable(tablename, columnumber, isNumber) {
    var tbl = document.getElementById(tablename).tBodies[0];
    var store = [];

    for (var i = 0, len = tbl.rows.length; i < len; i++) {
        var row = tbl.rows[i];
        if (columnumber > row.cells.length) { return; }
        var sortnr

        if (isNumber) {
            sortnr = parseFloat(row.cells[columnumber].textContent || row.cells[columnumber].innerText);
        }
        else {
            sortnr = (row.cells[columnumber].textContent || row.cells[columnumber].innerText);
        }

        store.push([sortnr, row]);
    }
    store.sort(function (x, y) {
        return x[0] - y[0];
    });
    for (var i = 0, len = store.length; i < len; i++) {
        tbl.appendChild(store[i][1]);
    }
    store = null;
}

function showEmployeeSchedules(repnum) {
    toggleDiv("divLoader", true, null);
    $("#divEmployeeTasks").css({ "display": "block" })

    $("#floatingtitle").text("");
    $("#floatingdivbody").html("");
    var s = '';
    var e = '';
    var note = '';

    s = '<table id="tblMerchandiserStoreAssignments" class="table table-bordered sorttable " style="color:#2A4480;vertical-alignment:top; max-height:350px;max-width:680px;"><thead>';
    s += '<tr><th class="sortfield">Schedule</th><th class="sortfield">#</th><th class="sortfield">Store</th><th class="sortfield">Address</th><th class="sortfield">City</th><th class="sortfield">ST</th><th class="sortfield">Zip</th><th class="sortfield">Job</th><th class="sortfield">Type</th></tr></thead><tbody>';

    $.ajax({
        type: "POST",
        async: false,
        url: "forceoneData.asmx/GetEmployeeLastNote",
        data: "{repnum: " + repnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            note = data.d;
        },
        error: AjaxFailed
    });

    $.ajax({
        type: "POST",
        async: false,
        url: "forceoneData.asmx/GetListOfMerchandiserAssignment",
        data: "{repnum: " + repnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {

            if (data.d.length > 0) {
                $("#floatingtitle").text(toProperCase(data.d[0].FirstName.toString() + " " + data.d[0].LastName.toString()) + " (" + data.d[0].RepNum + ")");
                e = '<table style="max-width:650px; border-collapse:separate; border-spacing:7px;">';
                e += '  <tr>';
                e += '      <td valign="top" style="width:10%;"><strong>Name:</strong></td>';
                e += '      <td valign="top" style="width:25%;"> ' + toProperCase(data.d[0].FirstName.toString() + ' ' + data.d[0].LastName.toString()) + '</td>';
                e += '      <td valign="top" style="width:15%;"><strong>Address:</strong></td>';
                e += '      <td valign="top" style="width:25%;">' + toProperCase(data.d[0].RepAddress.toString());
                e += ' ' + toProperCase(data.d[0].RepCity.toString()) + ', ' + data.d[0].RepST.toString().toUpperCase() + ' ' + data.d[0].RepZip.toString() + '</td>';
                e += '      <td rowspan="2" style="width:25%; padding:3px; vertical-align:top;"><strong>Note</strong><br />' + note.replace("'", "`") + '<br />';
                e += '          <a href="javascript:void(0);" onclick="showEmployeeNotes(' + data.d[0].RepNum + ',\'' + data.d[0].FirstName.replace("'", "`") + ' ' + data.d[0].LastName.replace("'", "`") + '\');">more...</a>';
                e += '      </td>';
                e += '  </tr>';
                e += '  <tr>';
                e += '      <td valign="top"><strong>Phone:</strong></td>';
                e += '      <td valign="top">' + data.d[0].RepPhone.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') + '</td>';
                e += '      <td valign="top"><strong>Cell:</strong></td>';
                e += '      <td valign="top"> ';

                if (data.d[0].RepCell != "") {
                    if (data.d[0].AllowText == true && data.d[0].ContactPhoneProvider != "") {
                        e += '<a href="#" onclick="sendtext(' + data.d[0].RepCell.toString() + ',' + data.d[0].RepNum.toString() + ',\'' + data.d[0].ContactPhoneProvider + '\',\'' + toProperCase(data.d[0].FirstName.toString().replace('\'', '`') + " " + data.d[0].LastName.toString().replace('\'', '`')) + '\',\'\', \'\'); return false;">' + data.d[0].RepCell.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') + '</a>';
                    }
                    else {
                        e += data.d[0].RepCell.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                    }
                }
                else {
                    e += data.d[0].RepCell.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
                }
                e += '      </td>';
                e += '  </tr>';

                e += '  <tr>';
                e += '      <td><strong>Email:</strong></td>';
                e += '      <td valign="top">';
                if (data.d[0].RepEmail != '') {
                    e += '<a href="mailto:' + data.d[0].RepEmail + '">' + data.d[0].RepEmail.toString() + '</a>';
                }
                e += '      </td>';
                e += '      <td valign="top"><strong>Emp Type:</strong></td>';
                e += '      <td> ' + data.d[0].EmployeeType + '</td>';
                // Add Payrate
                e += '      <td valign="top"><strong>Pay Rate:</strong> ' + data.d[0].payrate + '</td>';

                e += '  </tr>';

                e += '</table><br />';

                jQuery.each(data.d, function (rec) {
                    s += '<tr>';
                    s += '<td sorttable_customkey="' + this.DateSchedule + ' ' + formatjsondateMMDDYYYY(this.ExpectedTimeIn) + this.StoreName + this.StoreNumber + '">' + formatjsondateMMDDYYYY(this.DateSchedule) + ' ' + this.ExpectedTimeIn + '</td>';
                    s += '<td sorttable_customkey="' + this.StoreNumber + '-' + this.jobnum + '">' + this.StoreNumber + '</td>';
                    s += '<td sorttable_customkey="' + this.StoreName + this.StoreNumber + this.StoreCity + this.StoreAddress + this.StoreST + this.jobnum + '">' + this.StoreName + '</td>';
                    s += '<td sorttable_customkey="' + this.StoreAddress + this.jobnum + '">' + this.StoreAddress + '</td>';
                    s += '<td sorttable_customkey="' + this.StoreCity + this.StoreName + this.StoreNumber + '-' + this.jobnum + '">' + this.StoreCity + '</td>';
                    s += '<td sorttable_customkey="' + this.StoreST + this.StoreName + this.StoreNumber + '-' + this.jobnum + '">' + this.StoreST + '</td>';
                    s += '<td sorttable_customkey="' + this.StoreZip + this.StoreName + this.StoreNumber + '-' + this.jobnum + '">' + this.StoreZip + '</td>';
                    s += '<td sorttable_customkey="' + this.jobdesc + this.StoreName + this.StoreNumber + '">' + this.jobdesc + '</td>';
                    s += '<td sorttable_customkey="' + this.JobType + this.jobdesc + this.StoreName + this.StoreNumber + '">' + this.JobType + '</td>';
                    s += '</tr>'
                });

            };


        },
        error: AjaxFailed
    });            //end update

    s += '</tbody></table>';
    $("#floatingdivbody").html(e + s);
    sorttable.makeSortable(document.getElementById("tblMerchandiserStoreAssignments"));
    toggleDiv("divLoader", false, null);
}

function showStoreSchedulesByStoreNumber(storenumber) {
    toggleDiv("divLoader", true, null);
    $("#divStoreSchedules").css({ "display": "block" })

    $("#floatingtitledivStoreSchedules").text("");
    $("#floatingdivbody").html("");
    var s = '';
    var e = '';

    s = '<table id="tblStoreRepsAssignments" class="table table-bordered sorttable " style="color:#2A4480;vertical-alignment:top; max-height:350px;max-width:680px;"><thead>';
    s += '<tr><th class="sortfield">Rep Name</th><th class="sortfield">Job Name</th><th class="sortfield">Date Schedule</th></tr></thead><tbody>';

    $.ajax({
        type: "POST",
        async: false,
        url: "forceoneData.asmx/GetSchedulesByStoreNumber",
        data: "{StoreNumber: " + storenumber + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {

            if (data.d.length > 0) {
                $("#floatingtitledivStoreSchedules").text("Reps used by store " + toProperCase(data.d[0].storename));
                e = '<table style="max-width:650px; border-collapse:separate; border-spacing:7px;">';
                e += '  <tr>';
                e += '      <td valign="top" style="width:10%;"><strong>Store Name:</strong></td>';
                e += '      <td valign="top" style="width:25%;"> ' + data.d[0].storename.replace("'", "`") + '</td>';
                e += '      <td valign="top" style="width:15%;"><strong>Address:</strong></td>';
                e += '      <td valign="top" style="width:25%;">' + data.d[0].storeaddress.replace("'", "`") + '</td>';
                e += '  </tr>';
                e += '</table><br />';

                jQuery.each(data.d, function (rec) {
                    s += '<tr>';
                    s += '<td sorttable_customkey="' + this.lastname.replace("'", "`") + ', ' + this.firstname.replace("'", "`") + '">' + this.lastname.replace("'", "`") + ', ' + this.firstname.replace("'", "`") + '</td>';
                    s += '<td sorttable_customkey="' + this.jobdesc.replace("'", "`") + ' (' + this.jobnum + ')">' + this.jobdesc.replace("'", "`") + ' (' + this.jobnum + ')' + '</td>';
                    s += '<td sorttable_customkey="' + formatjsondateMMDDYYYY(this.dateschedule) + '">' + formatjsondateMMDDYYYY(this.dateschedule) + '</td>';
                    s += '</tr>'
                });
            };


        },
        error: AjaxFailed
    });            //end update

    s += '</tbody></table>';
    $("#floatingdivStoreSchedules").html(e + s);
    sorttable.makeSortable(document.getElementById("tblStoreRepsAssignments"));
    toggleDiv("divLoader", false, null);
}

function sendtext(repcell, repnum, contactphoneprovider, repname, subject, textbody) {

    $.msgbox("<p>Please enter your message below:</p>", {
        type: "prompt",
        inputs: [
            { type: "text", label: "Subject line:", value: subject, required: true },
            { type: "text", label: "Enter your text:", value: textbody, required: true }
        ],
        buttons: [
            { type: "submit", value: "Send" },
            { type: "cancel", value: "Exit" }
        ]
    }, function (_subject, _textbody) {
        if (_subject != "" && _textbody != "") {
            commitsend(repcell, repnum, contactphoneprovider, repname, _subject, _textbody);
        }
    });

}

function commitsend(repcell, repnum, contactphoneprovider, repname, subject, textbody) {
    if (subject == "" || textbody == "" || repcell == "") {
        $.msgbox("Incomplete information provided.", { type: "info" });
        return false;
    }

    $.msgbox("You are about to send this message to <br /><strong>Rep Name: </strong>" + repname + "<br /><strong>Phone #:</strong> " + repcell.toString().replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') + "<br /><strong>Subject: </strong>" + subject + "<br /><strong>Text: </strong>" + textbody, {
        type: "confirm",
        buttons: [
            { type: "submit", value: "Continue" },
            { type: "cancel", value: "Cancel" }
        ]
    }, function (result) {
        if (result) {
            //string RepCell, int RepNum, string ContactPhoneProvider, string Subject, string TextBody
            $.ajax({
                type: "POST",
                url: "forceoneData.asmx/SendTextMessage",
                data: "{RepCell: '" + repcell + "', RepNum: " + repnum + ", ContactPhoneProvider: '" + contactphoneprovider + "', Subject: '" + Base64.encode(subject) + "', TextBody: '" + Base64.encode(textbody) + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.d == 1) {
                        //$.msgbox("The job was successfully diabled.", { type: "alert", buttons: [{ type: "submit", value: "OK"}] });
                        $.msgbox("Message was successfully sent to " + repname + ".", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                    }
                    else {
                        $.msgbox("An error has occured while sending the text to  " + repname + ".", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                    }
                },
                error: AjaxFailed
            });   //end update /ajax
        }
        else {
            //send it back to text entry:
            sendtext(repcell, repnum, contactphoneprovider, repname, subject, textbody);
        }
    });
}

function voidInvoice(IID) {

    if (IID > 0) {
        $.msgbox("You are about to void this invoice ID " + IID + ".<br /><br />Do you wish to continue?", {
            type: "confirm",
            buttons: [
                { type: "submit", value: "Yes" },
                { type: "cancel", value: "Cancel" }
            ]
        },
        function (result) {
            if (result) {

                $.ajax({
                    type: "POST",
                    url: "forceoneData.asmx/VoidInvoice",
                    data: "{IID: " + IID + "}",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.d == 3) {
                            //$.msgbox("The job was successfully diabled.", { type: "alert", buttons: [{ type: "submit", value: "OK"}] });
                            $.msgbox("Invoice ID " + IID + " was successfully voided.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                            $("#lnkVoidInvoice_" + IID).remove();
                            $("#divinvoicevoid_" + IID).html("Yes");
                        }
                        else {
                            $.msgbox("Unable to void Invoice ID " + IID + ".", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                        }
                    },
                    error: AjaxFailed
                });   //end update /ajax
            } //confirm result
            else {

            }
        });  //message box
    }
    else {
        $.messagebox("You cannot void this invoice right now. Invoice ID is not set.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
    } //end if iid
}

function disableJob(jobnum) {

    $.msgbox("You are about to delete job number " + jobnum + ".<br />Are you sure you want to delete this job?", {
        type: "confirm",
        buttons: [
                { type: "submit", value: "Yes" },
                { type: "cancel", value: "Cancel" }
        ]
    },
        function (result) {
            if (result) {
                $.ajax({
                    type: "POST",
                    url: "forceoneData.asmx/DisableJob",
                    data: "{JobNum: " + jobnum + "}",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.d == 1) {
                            //$.msgbox("The job was successfully diabled.", { type: "alert", buttons: [{ type: "submit", value: "OK"}] });
                            window.location.replace("jobentry.aspx");
                        }
                        else {
                            $.msgbox("Cannot disable the job.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                        }
                    },
                    error: AjaxFailed
                }); //end update
            }   //end if
        }   //end function
    );    // end msgbox
}

function deletePending(jobnum) {
    // Get the count of pending shift and display it
    $.ajax({
        type: "POST",
        url: "forceoneData.asmx/GetPendingByJobNum",
        data: "{JobNum: " + jobnum + "}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.d > 0) {
                $.msgbox("You are about to delete <b>" + data.d + "</b> pending shifts for Job # " + jobnum + " dated before " + new Date() + ".<br /><br />Are you sure you wish to do so?", {
                    type: "confirm",
                    buttons: [
                        { type: "submit", value: "Yes" },
                        { type: "cancel", value: "Cancel" }
                    ]
                },
                    function (result) {
                        if (result) {
                            $.ajax({
                                type: "POST",
                                url: "forceoneData.asmx/DeletePendingByJobNum",
                                data: "{JobNum: " + jobnum + "}",
                                contentType: "application/json; charset=utf-8",
                                dataType: "json",
                                success: function (data) {
                                    if (data.d > 0) {
                                        $.msgbox("Deleted " + data.d + " pending for Job # " + jobnum + ".", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                                        get


                                        window.location.replace("jobentry.aspx");
                                    }
                                    else {
                                        $.msgbox("Error deleting pending for Job # " + jobnum + ".", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
                                    }
                                },
                                error: AjaxFailed
                            }); //end update
                        }   //end if
                    }   //end function
                );    // end msgbox
            }
            else {
                $.msgbox("There are " + data.d + " pending shifts for Job # " + jobnum + ".", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
            }
        },
        error: AjaxFailed
    }); //end update
}

function toggleDiv(divname, show, movetoobject) {
    if (show == true) {
        $("#" + divname).show();
        $("#" + divname).css({ "visibility": "visible" });

        if (movetoobject != null) {
            var pos = $(movetoobject).position();

            $("#" + divname).css({
                position: "absolute",
                top: (pos.top + 40) + "px",
                left: (pos.left + 20) + "px"
            }).show();
        }


    } //.css({'background-color': '#ffe', 'border-left': '5px solid #ccc'})
    else {
        $("#" + divname).hide();
        $("#" + divname).css({ "visibility": "visible" });
    }
}

//this function is used by task.aspx & jobentry.aspx
function getHoursTotal(otimein, otimeout, lblDays, lblHours, lblMinutes) {
    var timein = $("#" + otimein).val();
    var timeout = $("#" + otimeout).val();
    var expectedworkhourscalc = $("#" + oexpectedworkhourscalc).val();

    if (timein != "") {
        if (isNaN(Date.parse("1/1/00 " + timein))) {
            return "Start time is not a valid time.";
        }
    }

    if (timeout != "") {
        if (isNaN(Date.parse("1/1/00 " + timeout))) {
            return "End time is not a valid time.";
        }
    }

    if (timeout == "" && timein != "")
    { return "ok"; }

    if (timeout != "" && timein == "") {
        return "Enter start time.";
    }

    var dTimeIn = new Date("1/1/00 " + timein);
    var dTimeOut = new Date("1/1/00 " + timeout);

    if (dTimeOut < dTimeIn) {
        dTimeOut.setDate(dTimeOut.getDate() + 1);
    }

    var timelapse = dTimeOut.getTime() - dTimeIn.getTime();
    var daysDifference = Math.floor(timelapse / 1000 / 60 / 60 / 24);
    timelapse -= daysDifference * 1000 * 60 * 60 * 24

    var hoursDifference = Math.floor(timelapse / 1000 / 60 / 60);
    timelapse -= hoursDifference * 1000 * 60 * 60

    var minutesDifference = Math.floor(timelapse / 1000 / 60);
    timelapse -= minutesDifference * 1000 * 60

    $("#" + lblDays).html(daysDifference);
    $("#" + lblHours).html(hoursDifference);
    $("#" + lblMinutes).html(minutesDifference);

    var billtype = $("#" + obilltype).val();
    var expWorkHours = $("#" + oexpectedworkhours).val();

    if (expectedworkhourscalc > 0) {
        expWorkHours = expectedworkhourscalc;
    }
    else {
        if (expWorkHours == 0) { //less than an hour
            expWorkHours = 1;
        }
        else if (expWorkHours == 1) {//an hour or so
            expWorkHours = 1.75;
        }
    }

    if (billtype == 2 && $("#" + ocomments).val() == "") {//hourly
        if ((hoursDifference * 60) + minutesDifference > (expWorkHours * 60.0) + 5) {
            $.msgbox("Your total work hours is more than the time expected.<br />Please fill in the comments box why the job was taking longer expected.<br />Thank you.", { type: "info", buttons: [{ type: "submit", value: "OK" }] });
        }
    }
}

function allowjobfinish() {
    $("#txtcomplete").prop('disabled', false);

    if ($("#inputbilltype").val() == "" || $("#inputbilltype").val() == "0") {
        $("#txtcomplete").prop('disabled', true);
    }

    if ($("#txtbillingrate").val() == "" || $("#txtbillingrate").val() == "0.00") {
        $("#txtcomplete").prop('disabled', true);
    }

    if ($("#txtClientNum").val() == "" || $("#txtClientNum").val() == "0") {
        $("#txtcomplete").prop('disabled', true);
    }
}

function updatemanagernote(idx, comment) {
    $.msgbox("<p>Please enter your comment:</p>", {
        type: "prompt",
        inputs: [
          { type: "textarea", rows: 3, label: "", value: comment, required: false }
        ],
        buttons: [
          { type: "submit", value: "OK" },
          { type: "cancel", value: "Exit" }
        ]
    }, function (newcomment) {
        if (newcomment) {
            savemanagernote(idx, newcomment);
        }
    });
}

function updateadminnote(idx, comment) {
    $.msgbox("<p>Please enter your comment:</p>", {
        type: "prompt",
        inputs: [
          { type: "textarea", label: "", value: comment, required: false }
        ],
        buttons: [
          { type: "submit", value: "OK" },
          { type: "cancel", value: "Exit" }
        ]
    }, function (newcomment) {
        if (newcomment) {
            saveadminnote(idx, newcomment);
        }
    });
}

function savemerchandisernote(idx, newcomment) {

    $.ajax({//Save date by idx
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateMerchandiserNoteByIDx",
        data: "{idx: " + idx + ", newcomment: '" + Base64.encode(newcomment) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {

        },
        error: AjaxFailed
    });          //end ajax
}

function savemanagernote(idx, newcomment) {

    $.ajax({//Save date by idx
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateManagerNoteByIDx",
        data: "{idx: " + idx + ", newcomment: '" + Base64.encode(newcomment) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            $('#divManagerComment' + idx).text(newcomment);
        },
        error: AjaxFailed
    });          //end ajax
}

function saveadminnote(idx, newcomment) {

    $.ajax({//Save date by idx
        async: false,
        type: "POST",
        url: "forceoneData.asmx/UpdateAdminNoteByIDx",
        data: "{idx: " + idx + ", newcomment: '" + Base64.encode(newcomment) + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            $('#divAdminComment' + idx).text(newcomment);
        },
        error: AjaxFailed
    });          //end ajax
}

function postDateDiff() {
    getHoursTotal(otxttimein, otxttimeout, olbldays, olblhours, olblminutes);
}

(function ($) {  // custom css expression for a case-insensitive contains()
    jQuery.expr[':'].Contains = function (a, i, m) { return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase()) >= 0; };

    function listFilter(list, txtFilter) { // header is any element, list is an unordered list
        // create and add the filter form to the header
        //$("#txtChainFilter")
        $(txtFilter)
          .change(function () {

              if ($(txtFilter).attr('id') == "txtStoreFilter") {
                  $("#divListOfStoresByChainId").css("display", "block");
                  $("#divListOfChains").css("display", "none");
              }
              else if ($(txtFilter).attr('id') == "txtChainFilter") {
                  $("#divListOfStoresByChainId").css("display", "none");
                  $("#divListOfChains").css("display", "block");
              }
              else if ($(txtFilter).attr('id') == "txtClientFilter") {
                  $("#divListOfClients").css("display", "block");
              }

              var filter = $(this).val();
              if (filter) {
                  // this finds all links in a list that contain the input,
                  // and hide the ones not containing the input while showing the ones that do
                  $(list).find("a:not(:Contains(" + filter + "))").parent().slideUp();
                  $(list).find("a:Contains(" + filter + ")").parent().slideDown();
              } else {
                  $(list).find("li").slideDown();
              }
              return false;
          })
        .keyup(function () {
            // fire the above change event after every letter
            $(this).change();
        });
    }

    //ondomready
    $(function () {
        var viewButton = document.getElementById("toggleViewButton");
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
            ismobile = true;
            if (viewButton) {
                viewButton.innerHTML = '<i class="bi bi-phone"></i>';
            }
        }
        else {
            ismobile = false;
            if (viewButton) {
                viewButton.innerHTML = '<i class="bi bi-pc-display-horizontal"></i>';
            }
        }     
           
        /*
        $("#divScheduler").hover(function () {
        $(this).css('cursor', 'cross');
        }, function () {
        $(this).css('cursor', 'auto');
        });

        $("#divScheduler").draggable();
        $("#divStoreAdd").draggable();
        $("#divUpdateStore").draggable();*/

        //$("#divJobInfo").draggable();

        //create event for job update control
        $("#inputbilltype")
        .change(function () {
            allowjobfinish();
        });

        $("#txtbillingrate")
        .change(function () {
            allowjobfinish();
        });

        $("#txtClientNum")
        .change(function () {
            allowjobfinish();
        });
        //end create event for job update control


        $("#txtstartdate").datepicker();
        $("#txtenddate").datepicker();
        $("#inlinecalendar").datepicker();
        $("#txtcomplete").datepicker();
        $("#txtSearchByStartDate").datepicker();
        $("#txtSearchByEndDate").datepicker();

        listFilter($("#drpListOfChains"), $("#txtChainFilter"));
        listFilter($("#drpListOfStoresByChainId"), $("#txtStoreFilter"));
        listFilter($("#drpListOfClients"), $("#txtClientFilter"));
        $("#divListOfStoresByChainId").css("display", "none");
        $("#divListOfClients").css("display", "none");
        showProgressBar(false, "divStoreSearch", "divStoreSearchProgressBar", 0);

        $("#spanMapViewer").hide();

        $('span[id^="spanJobID_CountOfStoresNoSchedule_"]', "#divJobsAccordion").each(function (index) {
            var countOfStoresNoSchedule = $('#' + this.id).html();
            var a = this.id.split("_");
            var jobnum = a[2];

            if (countOfStoresNoSchedule > 0) {
                $('#warning_jobnum_' + jobnum).css("visibility", "visible");
                $('#spanJobID_CountOfStoresNoSchedule_' + jobnum).css("color", "red");
            }
        });

        /*
        $("#divGridView table tbody tr").mouseover(function () {
        $(this).addClass("highlightRow");
        }).mouseout(function () { $(this).removeClass('highlightRow'); })
        });

        // highlight row by clicking it
        $(document).ready(function () {
        $("#divGridView table tbody tr").click(function () {
        $(this).addClass("select");
        })
        });

        // double click delete rows
        $(document).ready(function () {
        $("#divGridView table tbody tr").dblclick(function () {
        // find the id first
        var v = confirm('Are you sure to delete?');
        if (v) {
        var autoId = $(this).find("td:first").text();
        // remove the row from server side (the database)
        DeleteRecord(autoId);
        // remove from the clien side
        $(this).remove();
        }
        })

        $('body').css({ 'overflow': 'hidden' });
        $(document).bind('scroll', function () {
            window.scrollTo(0, 0);
        });

        $(document).unbind('scroll');
        $('body').css({ 'overflow': 'visible' });
        */

        $("#inlinecalendar").multiDatesPicker({
            altField: "#scheduler_idfJobStoresAssigned",
            onSelect: function (dataText) {
                addOrRemoveDateFromScheduler(dataText);
            }
        });
        $("#inlinecalendar").hide();    //calendar in scheduler
        $('#inlinecalendarhost').hide();
    });

}(jQuery));
