<%@ Page Title="" Language="C#" MasterPageFile="~/forceone.Master" AutoEventWireup="true" CodeBehind="store.aspx.cs" Inherits="ForceOne.store" %>

<asp:Content ID="Content1" ContentPlaceHolderID="contentPlaceHolder_Header" runat="server">
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="placeholderBody" runat="server">
    <script type="text/javascript">
        $("body").css("background-color", "black");
        $("body").css("visibility", "hidden");
        const high = 580;
        const low = 210;
        var addToolOpen = false;
        var historyToolOpen = false;
    </script>
    <nav>
        <div class="nav nav-tabs" id="nav-tab" role="tablist">
            <button class="nav-link active" id="nav-stores-tab" data-bs-toggle="tab" data-bs-target="#nav-stores" type="button" role="tab" aria-controls="nav-stores" onclick="reCalcStores();return false;" aria-selected="true">Stores</button>
            <button class="nav-link" id="nav-bulkstore-tab" data-bs-toggle="tab" data-bs-target="#nav-bulkstore" type="button" role="tab" aria-controls="nav-bulkstore" aria-selected="false">Bulk</button>
            <button class="nav-link" id="nav-log-tab" data-bs-toggle="tab" data-bs-target="#nav-log" type="button" role="tab" aria-controls="nav-log" aria-selected="false"  onclick="reCalcLog();return false;">Log</button>
        </div>
    </nav>
    <div class="tab-content" id="nav-tabContent">
        <div class="tab-pane fade show active" id="nav-stores" role="tabpanel" aria-labelledby="nav-stores-tab">
            <div class="card">
                <div id="divgrvstores" class="card-body" style="background: #212529">
                    <div class="card-body" style="color:white">
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox1" value="option1">
                            <label class="form-check-label" for="inlineCheckbox1">Region 1</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox2" value="option2">
                            <label class="form-check-label" for="inlineCheckbox2">Region 2</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox3" value="option3">
                            <label class="form-check-label" for="inlineCheckbox3">Region 3</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox4" value="option4">
                            <label class="form-check-label" for="inlineCheckbox4">Region 4</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox5" value="option5">
                            <label class="form-check-label" for="inlineCheckbox5">Region 5</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox6" value="option6">
                            <label class="form-check-label" for="inlineCheckbox6">Region 6</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox7" value="option7">
                            <label class="form-check-label" for="inlineCheckbox7">Region 7</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox8" value="option8">
                            <label class="form-check-label" for="inlineCheckbox8">Region 8</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox9" value="option9">
                            <label class="form-check-label" for="inlineCheckbox9">Region 9</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox10" value="option10">
                            <label class="form-check-label" for="inlineCheckbox10">Safeway</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="checkbox" id="inlineCheckbox11" value="option11">
                            <label class="form-check-label" for="inlineCheckbox11">On File</label>
                        </div>
                        <div class="form-inline">
                            <input class="form-control" id="drpSearchChainsChoice" list="drpSearchChains" style="width: 150px" aria-label="" hidden>
                            <label for="drpChainsChoice" hidden>Chain</label>
                            <datalist id="drpSearchChains" hidden></datalist>
                        </div>
                    </div> <!-- Filters -->
                    <div style="padding-bottom: 10px"></div>
                    <asp:GridView ID="grvStores" runat="server" CssClass="table table-light" AutoGenerateColumns="false" Style="text-align: left; float: left" HeaderStyle-HorizontalAlign="Center">
                        <Columns>
                            <asp:BoundField DataField="StoreID" HeaderText="StoreID" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="StoreNumber" HeaderText="StoreNumber" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="StoreName" HeaderText="StoreName" ItemStyle-HorizontalAlign="Center" ItemStyle-Width="120%" />
                            <asp:BoundField DataField="Address1" HeaderText="Address1" ItemStyle-HorizontalAlign="Center" ItemStyle-Width="120%" />
                            <asp:BoundField DataField="Address2" HeaderText="Address2" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="City" HeaderText="City" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="ST" HeaderText="ST" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="Zip" HeaderText="Zip" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="PhoneMain" HeaderText="Phone" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="Fax" HeaderText="Fax" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="Contact" HeaderText="Contact" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="Disabled" HeaderText="Disabled" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="territoryName" HeaderText="Territory" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="territorySupervisorName" HeaderText="TM / DM" ItemStyle-HorizontalAlign="Center" />
                            <asp:BoundField DataField="LastDateOfService" HeaderText="Last Date Of Service" ItemStyle-HorizontalAlign="Center" />
                        </Columns>
                    </asp:GridView>
                    <div style="text-align: center">
                        <div class="" id="HistoryTool" style="min-width: 100%; display: none;">
                            <table id="tblStoreHistory" class="table table-light">
                                <thead>
                                    <tr>
                                        <th>Job #</th>
                                        <th>Desc</th>
                                        <th>StoreID</th>
                                        <th>Rep #</th>
                                        <th>Name</th>
                                        <th>Date Schedule</th>
                                        <th>Time In</th>
                                        <th>Time Out</th>
                                        <th>Comment</th>
                                        <th>EWH</th>
                                        <th>Cases</th>
                                        <th>Rate</th>
                                        <th style="min-width:100px">Manager Note</th>
                                        <th>idx</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>
                        <div class="card" id="AddTool" style="width: 100%; display: none;">
                            <div class="card-title">
                                <div class="" runat="server" id="alert" role="alert" style="">
                                </div>
                            </div>
                            <div class="card-body">
                                <div class="row g-7">
                                    <!-- Store ID -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="number" class="form-control" id="inputStoreID" onchange="clearInput();" placeholder="" min="1" max="9999999" value="">
                                            <label for="inputStoreNumber">Store ID</label>
                                        </div>
                                    </div>
                                    <!-- Store Name -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input class="form-control" id="drpChainsChoice" list="drpChains" onchange="getStoreID();setWarning(drpChainsChoice)" aria-label="">
                                            <label for="drpChainsChoice">Store Name <b style="color: red">*</b></label>
                                            <datalist id="drpChains"></datalist>
                                        </div>
                                    </div>
                                    <!-- Store # -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="number" class="form-control" id="inputStoreNumber" onchange="getStoreID();setWarning(inputStoreNumber)" placeholder="" min="1" max="9999999" value="">
                                            <label for="inputStoreNumber">Store # <b style="color: red">*</b></label>
                                        </div>
                                    </div>
                                    <!-- Territory Name -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <asp:DropDownList ID="drpTerritoryName" CssClass="form-control" onchange="setWarning(ctl00_placeholderBody_drpTerritoryName)" runat="server"></asp:DropDownList>
                                            <label for="drpTerritoryName">Territory</label>
                                        </div>
                                    </div>
                                    <!-- Territory Supervisor -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <asp:DropDownList ID="drpTerritoryManager" CssClass="form-control" onchange="setWarning(ctl00_placeholderBody_drpTerritoryManager)" runat="server"></asp:DropDownList>
                                            <label for="drpTerritoryManager">TM / DM</label>
                                        </div>
                                    </div>
                                    <!-- Address1 -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="inputAddress1" onchange="setWarning(inputAddress1)" placeholder="" value="">
                                            <label for="inputAddress1">Address1 <b style="color: red">*</b></label>
                                        </div>
                                    </div>
                                    <!-- Address2 -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="inputAddress2" onchange="setWarning(inputAddress2)" placeholder="" value="">
                                            <label for="inputAddress2">Address2</label>
                                        </div>
                                    </div>
                                </div>
                                <div style="padding-bottom: 10px"></div>
                                <div class="row g-7">
                                    <!-- City -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="inputCity" onchange="setWarning(inputCity)" placeholder="" value="">
                                            <label for="inputCity">City <b style="color: red">*</b></label>
                                        </div>
                                    </div>
                                    <!-- State -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <asp:DropDownList ID="drpSt" CssClass="form-control dropdown" onchange="setWarning(ctl00_placeholderBody_drpSt)" runat="server"></asp:DropDownList>
                                            <label for="drpSt">ST <b style="color: red">*</b></label>
                                        </div>
                                    </div>
                                    <!-- Zip -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="inputZip" onchange="setWarning(inputZip)" placeholder="" value="">
                                            <label for="inputZip">Zip <b style="color: red">*</b></label>
                                        </div>
                                    </div>

                                    <!-- Phone -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="inputPhone" onchange="setWarning(inputPhone)" placeholder="" value="">
                                            <label for="inputPhone">Phone</label>
                                        </div>
                                    </div>
                                    <!-- Fax -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="inputFax" onchange="setWarning(inputFax)" placeholder="" value="">
                                            <label for="inputFax">Fax</label>
                                        </div>
                                    </div>
                                    <!-- Contact -->
                                    <div class="col-md">
                                        <div class="form-floating">
                                            <input type="text" class="form-control" id="inputContact" onchange="setWarning(inputContact)" placeholder="" value="">
                                            <label for="inputContact">Contact</label>
                                        </div>
                                    </div>
                                    <div class="col-md">
                                        <input type="checkbox" class="form-check-input" id="inputDisabled" onchange="setWarning(inputDisabled)" placeholder="" value="" style="width: 25px; height: 25px">
                                        <label for="inputDisabled">Disabled <b style="color: red">*</b></label>
                                    </div>
                                </div>
                                <div style="padding-bottom: 10px"></div>
                                <p class="card-text">Required <b style="color: red">*</b></p>
                                <hr />
                                <div>
                                        <button id="btnReset" type="button" onclick="clearInput();return false;" class="btn btn-secondary" style="width: 100px; text-align: center">Clear</button>
                                        <button id="btnAddStore" runat="server" onclick="saveStoreInfo();return false;" class="btn btn-primary" style="width: 100px; text-align: center">Submit</button>
                                </div>
                            </div>
                            <hr>
                        </div>
                    </div>
                </div>
        </div>
        </div>
        <div class="tab-pane fade" id="nav-bulkstore" role="tabpanel" aria-labelledby="nav-bulkstore-tab">
            <div class="card">
                <h5 class="card-body">Bulk Upload</h5>
                <div class="card-body">
                    <div class="" runat="server" id="alert2" role="alert">
                    </div>
                    <p class="card-text">Required <b style="color: red">*</b></p>
                    <p style="background: white; border: 1px solid red; text-align: left"><b>Store Name</b> (<b style="color: red">*</b>) | <b>Store Number</b> (<b style="color: red">*</b>) | <b>Territory</b> | <b>Supervisor</b> | <b>Address1</b> (<b style="color: red">*</b>) | <b>Address2</b> | <b>City</b> (<b style="color: red">*</b>) | <b>ST</b> (<b style="color: red">*</b>) | <b>Zip</b> (<b style="color: red">*</b>) | <b>Phone</b> | <b>Fax</b> | <b>Contact</b></p>
                    <textarea style="min-width: 100%" rows="10" id="bulk" name="bulk" placeholder="Store Name	Store #	Territory	Supervisor	Address1	Address2	City	ST	Zip	Phone	Fax	Contact"></textarea>
                    <hr />
                    <center>
                        <asp:Button ID="btnAddBulkStore" runat="server" OnClick="btnAddBulkStore_Click" class="btn btn-primary" Style="min-width: 50%; text-align: center" Text="Add Stores"></asp:Button></center>
                </div>
            </div>
        </div>
        <div class="tab-pane fade" id="nav-log" role="tabpanel" aria-labelledby="nav-log-tab">
            <div class="card">
                <div class="card-body" id="divtblStoreLog" style="background: #212529">
                    <table id="tblStoreLog" class="table table-light" style="min-width: 1600px;">
                        <thead>
                            <tr>
                                <th style="width: 40px;">#</th>
                                <th style="width: 60px;">Action</th>
                                <th style="min-width: 75px;">Time</th>
                                <th style="min-width: 50px;">StoreID</th>
                                <th style="min-width: 50px;">Store #</th>
                                <th style="min-width: 50px;">Chain</th>
                                <th style="min-width: 75px;">Changed By</th>
                                <th style="width: 30px;">Role</th>
                                <th style="min-width: 50px;"># of Field(s)</th>
                                <th style="min-width: 200px;">Details (From / To)</th>
                            </tr>
                        </thead>
                    </table>
                    <!-- tblEmployeeLog -->
                </div>
            </div>
        </div>
    </div>
    <script language="javascript" type="text/javascript">
        $(function () {
            getStores();
            getStoreHistory();
            getStoreLog();
            getStoreDropdowns();
        });
        $(document).ready(function () {
            $("body").css("visibility", "visible");
        });
        /* --- Alerts --- */
        function setAlert(msg, txtclassname, type) {
            var alert = document.getElementById('<%= alert.ClientID %>');
            alert.className = txtclassname;
            alert.innerHTML = "<strong>" + type + "</strong>" + msg;
        }
        function setAlert2(msg, txtclassname, type) {
            var alert = document.getElementById("<%= alert2.ClientID %>");
            alert.className = txtclassname;
            alert.innerHTML = "<strong>" + type + "</strong>" + msg;
        }

        /* --- Data Table(s) --- */
        function getStores() {
            $.ajax({
                type: "POST",
                url: "forceoneData.asmx/GetStoreList",
                data: "{}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: CreateTableStoreList,
                failure: function (response) {
                    alert(response.d);
                },
                error: function (response) {
                    alert(response.d);
                }
            });
        }
        function CreateTableStoreList(response) {
            var DateDiff = {

                inDays: function (d1, d2) {
                    var t2 = d2.getTime();
                    var t1 = d1.getTime();

                    return Math.floor((t2 - t1) / (24 * 3600 * 1000));
                },

                inWeeks: function (d1, d2) {
                    var t2 = d2.getTime();
                    var t1 = d1.getTime();

                    return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
                },

                inMonths: function (d1, d2) {
                    var d1Y = d1.getFullYear();
                    var d2Y = d2.getFullYear();
                    var d1M = d1.getMonth();
                    var d2M = d2.getMonth();

                    return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
                },

                inYears: function (d1, d2) {
                    return d2.getFullYear() - d1.getFullYear();
                }
            }
            var today = new Date();
            var x = high;
            var on = 0; // order #
            const table = $("[id*=grvStores]").DataTable(
                {
                    dom: 'Bfrtip',
                    bLengthChange: true,
                    lengthMenu: [[50, 100, 1000, 2500, -1], [50, 100, 1000, 2500, "ALL"]],
                    colReorder: true,
                    bFilter: true,
                    bSort: true,
                    scrollCollapse: true,
                    responsive: true,
                    bpaging: false,
                    bAutoWidth: false,
                    data: response.d,
                    buttons: [
                        'pageLength', 'spacer', 'copy', 'spacer', 'excel', 'spacer', 'colvis', 'spacer', 'colvisRestore', 'spacer',
                        {
                            text: 'Reset Alert(s) / Filter(s)',
                            action: function (e, dt, node, config) {
                                setAlert("", "", "");
                                setAlert2("", "", "");
                                clearFilters();
                                dt.draw();
                            }

                        },
                        'spacer',
                        {
                            text: 'Add Store',
                            action: function (e, dt, node, config) {
                                if (x == high) { // FULL-SIZE OP 
                                    $("#AddTool").show();
                                    addToolOpen = true;
                                    x = low;
                                }
                                else if (x == low && addToolOpen) {
                                    $("#AddTool").hide();
                                    addToolOpen = false;
                                    x = high;
                                }
                                else if (x == low && historyToolOpen) {
                                    $("#HistoryTool").hide();
                                    $("#AddTool").show();
                                    historyToolOpen = false;
                                    addToolOpen = true;
                                }

                                $(".dataTables_scrollBody").css("max-height", x + "px");
                                dt.draw();
                            }

                        },
                        'spacer',
                        {
                            text: 'Store History',
                            action: function (e, dt, node, config) {
                                if (x == high) {
                                    $("#HistoryTool").show();
                                    historyToolOpen = true;
                                    x = low;
                                    reCalc($('#tblStoreHistory'));
                                }
                                else if (x == low && historyToolOpen) {
                                    $("#HistoryTool").hide();
                                    historyToolOpen = false;
                                    x = high;
                                }
                                else if (x == low && addToolOpen) {
                                    $("#AddTool").hide();
                                    $("#HistoryTool").show();
                                    historyToolOpen = true;
                                    addToolOpen = false;
                                    reCalc($('#tblStoreHistory'));
                                }
                                $(".dataTables_scrollBody").css("max-height", x + "px");
                                dt.draw();
                            }
                        }, 
                        'spacer',
                        {
                            text: 'Re-size',
                            action: function (e, dt, node, config) {
                                reCalc($('#' + '<%= grvStores.ClientID %>'));
                                //$('#storesbyjobnum_' + jobnum.toString()).DataTable().ajax.reload();
                            }
                        }
                    ],
                    scrollY: x,
                    columns: [
                        {
                            'data': 'StoreID',
                            'render': function (data) {
                                if (data !== '') {
                                    data = '<button type="button" style="color:blue" onclick="getStoreInfo(' + data + ');return false;">' + data + '</button>';
                                }     //data = '<img src="' + data + '" alt="' + data + '" width="200" height="200">';
                                else
                                    data = '';
                                return data;
                            }
                        },
                        { 'data': 'StoreNumber' },
                        { 'data': 'StoreName' },
                        { 'data': 'Address1' },
                        { 'data': 'Address2' },
                        { 'data': 'City' },
                        { 'data': 'ST' },
                        { 'data': 'Zip' },
                        { 'data': 'PhoneMain' },
                        { 'data': 'Fax' },
                        { 'data': 'Contact' },
                        { 'data': 'Disabled' },
                        { 'data': 'territoryName' },
                        { 'data': 'territorySupervisorName' },
                        {
                            'data': 'LastDateOfService',
                            'render': function (data) {

                                if ((DateDiff.inMonths(new Date(data), today) > 1)) {
                                    data = '<b style="color:orange">' + data + '</b>';
                                }
                                else if ((DateDiff.inYears(new Date(data), today) > 1)) {
                                    data = '<b style="color:red">' + data + '</b>';
                                }
                                else {
                                    data = '<b style="color:green">' + data + '</b>';
                                }
                                return data;
                            }
                        }
                    ],
                    order: [[14, 'desc']]
                    ,
                    columnDefs: [
                        {
                            'targets': "all",
                            'className': 'dt-head-center'
                        },
                    ]
                });
            setFilters(table);
        };

        function getStoreHistory() {
            $.ajax({
                type: "POST",
                async: false,
                url: "forceoneData.asmx/GetStoreHistoryByStoreID",
                data: null,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: CreateTableStoreHistory,
                failure: function (response) {
                    alert(response.d);
                },
                error: function (response) {
                    alert(response.d);
                }
            });
        }
        function CreateTableStoreHistory(response) {
            const historytable = new DataTable("#tblStoreHistory",
                {
                    dom: 'Bfrtip',
                    bLengthChange: true,
                    lengthMenu: [[50, 100, 1000, -1], [50, 100, 1000, "ALL"]],
                    bFilter: true,
                    autoWidth: false,
                    bSort: true,
                    responsive: true,
                    scrollCollapse: true,
                    bpaging: false,
                    bAutoWidth: false,
                    data: response.d,
                    buttons: [
                        'pageLength', 'spacer', 'copy', 'spacer', 'excel', 'spacer', 'colvis', 'spacer', 'colvisRestore', 'spacer',
                        {
                            text: 'Re-size',
                            action: function (e, dt, node, config) {
                                reCalc($('#tblStoreHistory'));
                                //$('#storesbyjobnum_' + jobnum.toString()).DataTable().ajax.reload();
                            }
                        }
                    ],
                    scrollY: 225,
                    columns: [
                        { 'data': 'JobNum' },//0
                        { 'data': 'StoreHeader1' },//1
                        { 'data': 'StoreID' },//2
                        { 'data': 'repnum' },//3
                        { 'data': 'Rep' },//4
                        {
                            'data': 'dateschedule',//5
                            'render': function (data) {
                                if (data !== '' && data != null) {
                                    data = parseJsonDate(data).toLocaleDateString("en-us");
                                }
                                return data;
                            }
                        },
                        {
                            'data': 'timein',//6
                            'render': function (data) {
                                if (data !== '' && data != null) {
                                    data = datetimeLocal(parseJsonDate(data)).substring(11);
                                }
                                return data;
                            }
                        },
                        {
                            'data': 'timeout',//7
                            'render': function (data) {
                                if (data !== '' && data != null) {
                                    data = datetimeLocal(parseJsonDate(data)).substring(11);
                                }
                                return data;
                            }
                        },
                        { 'data': 'comment' },//8
                        { 'data': 'totalexpectedhourswork' },//9
                        { 'data': 'cases' },//10
                        { 'data': 'payrate' },//11
                        { 'data': 'managernote' },//12
                        { 'data': 'idx' }//13
                    ],
                    order: [[5, 'desc']],
                    columnDefs: [
                        {
                            'targets': "all",
                            'className': 'dt-head-center'
                        },
                        { className: "td-text-center", targets: "_all" },
                        { width: "40px", targets: [0, 1, 2, 3, 5, 6, 7, 9, 10, 11, 13] },
                        { width: "75px", targets: [4, 8] },
                        { width: "100px", targets: [12] },
                        {
                            target: 13,
                            visible: false
                        }
                    ]
                });
        }

        function getStoreLog() {
            $.ajax({
                async: false,
                type: "POST",
                url: "forceoneData.asmx/GetStoreLog",
                data: "",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: CreateTableStoreLog,
                failure: function (response) {
                    alert(response.d);
                },
                error: function (response) {
                    alert(response.d);
                }
            });
        }
        function CreateTableStoreLog(response) {
            var on = 0; // order number
            const storelogtable = new DataTable("#tblStoreLog",
                {
                    dom: 'Bfrtip',
                    processing: true,
                    serverside: true,
                    bLengthChange: true,
                    fixedHeader: true,
                    lengthMenu: [[1000, -1], [1000, "ALL"]],
                    colReorder: true,
                    bFilter: true,
                    bSort: true,
                    responsive: true,
                    scrollY: high,
                    //scrollX: 1600,
                    scrollCollapse: true,
                    bpaging: false,
                    bAutoWidth: false,
                    data: response.d,
                    /*
                    ajax: {
                            url: "forceoneData.asmx/GetEmployeeLog",
                            dataSrc: '',
                            type: "POST",
                            contentType: "application/json; charset=utf-8",
                            dataType: "json"
                    },
                    */
                    columns: [
                        { 'data': 'id'},
                        {
                            'data': 'Action',
                            'render': function (data) {
                                if (data == 'Update') {
                                    data = '<b style="color:orange">' + data + '</b>';
                                }
                                else if (data == 'Add') {
                                    data = '<b style="color:green">' + data + '</b>';
                                }
                                else {
                                    data = '<b style="color:black">' + data + '</b>';
                                }
                                return data;
                            }
                        },
                        {
                            'data': 'TimeOfChange',
                            'render': function (data) {
                                if (data !== '' && data != null) {
                                    data = '<h8 style="color:blue">' + parseJsonDate(data).toLocaleString(); + '</h8>';
                                }
                                return data;
                            }
                        },
                        {
                            'data': 'StoreID',
                            'render': function (data) {
                                data = '<b>' + data + '</b>';
                                return data;
                            }
                        },
                        { 'data': 'StoreNum' },
                        {
                            'data': 'StoreName',
                            'render': function (data) {
                                return data;
                            }
                        },
                        {
                            'data': 'UserName',
                            'render': function (data) {
                                data = '<b>' + data + '</b>';
                                return data;
                            }
                        },
                        {
                            'data': 'Role',
                            'render': function (data) {
                                if (data !== '' && data != null) {
                                    if (data == 'Administrator') {
                                        data = '<b style="color:purple">' + data + '</b>';
                                    }
                                    else if (data == 'Manager') {
                                        data = '<b style="color:green">' + data + '</b>';
                                    }
                                    else {
                                        data = '<b style="color:blue">' + data + '</b>';
                                    }
                                }
                                return data;
                            }
                        },
                        { 'data': 'CntRowsUpdated' },
                        {
                            'data': 'Details',
                            'render': function (data) {
                                if (data !== '' && data != null) {
                                    var d = data;
                                    var arr = d.split('|')
                                    var s = '<p>';
                                    for (var i = 0; i < arr.length - 1; i++) {
                                        s += i + 1 + ') ' + arr[i];
                                        s += '<br />';
                                    }
                                    s += '</p>';
                                    data = s;
                                }
                                return data;
                            }
                        }
                    ],
                    columnDefs:
                        [
                            {
                                'targets': "all",
                                'className': 'dt-head-center'
                            },
                            { "orderDataType": "dom-text", "targets": [1] }
                        ],
                    buttons: [
                        'pageLength', 'spacer', 'copy', 'spacer', 'excel', 'spacer', 'colvis', 'spacer', 'colvisRestore', 'spacer',
                        {
                            text: 'Re-size',
                            action: function (e, dt, node, config) {
                                reCalc($('#tblStoreLog'));
                                //$('#storesbyjobnum_' + jobnum.toString()).DataTable().ajax.reload();
                            }
                        }
                    ],
                    order: [[on, 'desc']]
                });
            /*
            setInterval(function () {
                employeelogtable.ajax.reload();
            }, 30000);
            */
        };

        function reCalc(table) {
            table.DataTable().columns.adjust();
            table.DataTable().responsive.recalc();
        }
        function reCalcStores() {
            reCalc($('#' + '<%= grvStores.ClientID %>'));
            reCalc($('#tblStoreHistory'));
            if (historyToolOpen || addToolOpen) {
                $(".dataTables_scrollBody").css("max-height", low + "px");
            }
        }
        function reCalcLog() {
            reCalc($('#tblStoreLog'));
            $(".dataTables_scrollBody").css("max-height", high + "px");
        }

        /* Data Table Function(s) */
        function reloadtable(tableid) {
            $(tableid).DataTable().ajax.reload();
        }

        /* Data Table Filter(s) */
        function setFilters(table) {
            var Region1 = document.querySelector('#inlineCheckbox1');
            var Region2 = document.querySelector('#inlineCheckbox2');
            var Region3 = document.querySelector('#inlineCheckbox3');
            var Region4 = document.querySelector('#inlineCheckbox4');
            var Region5 = document.querySelector('#inlineCheckbox5');
            var Region6 = document.querySelector('#inlineCheckbox6');
            var Region7 = document.querySelector('#inlineCheckbox7');
            var Region8 = document.querySelector('#inlineCheckbox8');
            var Region9 = document.querySelector('#inlineCheckbox9');
            var Safeway = document.querySelector('#inlineCheckbox10');
            var LSD = document.querySelector('#inlineCheckbox11');
            //var SB = document.querySelector('#drpSearchChainsChoice');

            // Custom range filtering function
            DataTable.ext.search.push(function (settings, data, dataIndex) {
                let territory = data[12];
                let lastDateofService = data[14];
                let chain = data[2];

                if (
                        // (chain == SB.value || SB.value == '')&&
                        (
                            (Region1.checked == true && territory == "Region 1" || Region2.checked == true && territory == "Region 2" || Region3.checked == true && territory == "Region 3" || Region4.checked == true && territory == "Region 4" || Region5.checked == true && territory == "Region 5" ||
                            Region6.checked == true && territory == "Region 6" || Region7.checked == true && territory == "Region 7" || Region8.checked == true && territory == "Region 8" || Region9.checked == true && territory == "Region 9" || Safeway.checked == true && territory == "Safeway" || LSD.checked == true && lastDateofService != '')
                            ||
                            (Region1.checked == false && Region2.checked == false && Region3.checked == false && Region4.checked == false && Region5.checked == false && Region6.checked == false & Region7.checked == false && Region8.checked == false && Region9.checked == false && Safeway.checked == false && LSD.checked == false)

                        )
                    )
                    return true;
                else
                    return false
        });


            // Changes to the inputs will trigger a redraw to update the table
            Region1.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Region2.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Region3.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Region4.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Region5.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Region6.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Region7.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Region8.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Region9.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            Safeway.addEventListener('input', function () {
                table.draw();
            });
            // Changes to the inputs will trigger a redraw to update the table
            LSD.addEventListener('input', function () {
                table.draw();
            });
            /*
            SB.addEventListener('input', function () {
                table.draw();
            });   
            */
        }
        function clearFilters() {
            var Region1 = document.querySelector('#inlineCheckbox1').checked = false;
            var Region2 = document.querySelector('#inlineCheckbox2').checked = false;
            var Region3 = document.querySelector('#inlineCheckbox3').checked = false;
            var Region4 = document.querySelector('#inlineCheckbox4').checked = false;
            var Region5 = document.querySelector('#inlineCheckbox5').checked = false;
            var Region6 = document.querySelector('#inlineCheckbox6').checked = false;
            var Region7 = document.querySelector('#inlineCheckbox7').checked = false;
            var Region8 = document.querySelector('#inlineCheckbox8').checked = false;
            var Region9 = document.querySelector('#inlineCheckbox9').checked = false;
            var Safeway = document.querySelector('#inlineCheckbox10').checked = false;
            var LSD = document.querySelector('#inlineCheckbox11').checked = false;

        }

        /* --- Getters --- */
        function getStoreDropdowns() {
            $.ajax({
                type: "POST",
                url: "forceoneData.asmx/GetListofStores",
                data: "{}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    var d = data.d;
                    for (var i = 0; i < d.length; i++) {
                        $('#drpChains').append("<option value='" + d[i].StoreName + "'></option>");
                        //$('#drpSearchChains').append("<option value='" + d[i].StoreName + "'></option>");
                    }
                },
                error: AjaxFailed
            });
        }
        function getStoreID() {
            var storeid;
            var storename = 'Walmart';
            storename = document.getElementById("drpChainsChoice").value;
            var storenumber = 0;
            storenumber = document.getElementById("inputStoreNumber").value;
            storeid = document.getElementById("inputStoreID").value;

            if (storenumber > 0) {
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "forceoneData.asmx/GetStoreID",
                    data: "{storename: '" + Base64.encode(storename) + "', storenumber: " + storenumber + "}",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        if (data.d > 0) {
                            clearInput();
                            getStoreInfo(data.d);
                            setWarning(document.getElementById("inputStoreID"));
                        }
                        else if (data.d <= 0) {

                        }
                    },
                    error: AjaxFailed
                });
            }
        }
        function getChainId(storename) {
            var ret;
            $.ajax({
                async: false,
                type: "POST",
                url: "forceoneData.asmx/GetChainID",
                data: "{ storename: '" + Base64.encode(storename) + "'}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    ret = data.d;

                },
                error: AjaxFailed
            });
            return ret;
        }
        function getStoreInfo(storeid) {
            $.ajax({
                type: "POST",
                url: "forceoneData.asmx/GetStoreInfo",
                data: "{ storeid: " + parseInt(storeid) + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    var d = data.d;
                    setStoreInfo(d);
                    $('#tblStoreHistory').DataTable().search(storeid).draw();
                },
                error: AjaxFailed
            });
        }

        /* --- Setters --- */
        function setStoreInfo(d) {
            var storeid = document.getElementById("inputStoreID");
            var storename = document.getElementById("drpChainsChoice");
            var storenum = document.getElementById("inputStoreNumber");
            var territory = document.getElementById('<%= drpTerritoryName.ClientID %>');
            var supervisor = document.getElementById('<%= drpTerritoryManager.ClientID %>');
            var address1 = document.getElementById("inputAddress1");
            var address2 = document.getElementById("inputAddress2");
            var city = document.getElementById("inputCity");
            var st = document.getElementById('<%= drpSt.ClientID %>');
            var zip = document.getElementById("inputZip");
            var phone = document.getElementById("inputPhone");
            var fax = document.getElementById("inputFax");
            var contact = document.getElementById("inputContact");
            var disabled = document.getElementById("inputDisabled");
            var serviced = document.getElementById("inputServiced");

            $(storeid).val(d[0].StoreID);
            $(storename).val(d[0].StoreName);
            $(storenum).val(d[0].StoreNumber);
            $(territory).val(d[0].territoryName);
            $(supervisor).val(d[0].territorySupervisorName);
            $(address1).val(d[0].Address1);
            $(address2).val(d[0].Address2);
            $(city).val(d[0].City);
            $(st).val(d[0].ST);
            $(zip).val(d[0].Zip);
            $(phone).val(d[0].PhoneMain);
            $(fax).val(d[0].Fax);
            $(contact).val(d[0].Contact);
            $(serviced).val(d[0].Serviced);
            $(disabled).prop("checked", d[0].Disabled);

            setNormal(storename);
            setNormal(storenum);
            setNormal(territory);
            setNormal(supervisor);
            setNormal(address1);
            setNormal(address2);
            setNormal(city);
            setNormal(st);
            setNormal(zip);
            setNormal(phone);
            setNormal(fax);
            setNormal(contact);
            setNormal(disabled);

            setAlert("", "", "");
        }
        function saveStoreInfo() {
            var storeid = document.getElementById("inputStoreID").value;
            var error = 0;
            error += checkStore(storeid);

            if (error == 0 && storeid > 0) {
                UpdateStoreInfo(storeid);
            }
            else if (error == 0) {
                if (confirm("Add new store?") == true) {
                    addStore();
                }
            }
        }

        function addStore() {
            var storename = document.getElementById("drpChainsChoice").value;
            var storenum = document.getElementById("inputStoreNumber").value;
            var territory = document.getElementById('<%= drpTerritoryName.ClientID %>').value;
            var supervisor = document.getElementById('<%= drpTerritoryManager.ClientID %>').value;
            var address1 = document.getElementById("inputAddress1").value;
            var address2 = document.getElementById("inputAddress2").value;
            var city = document.getElementById("inputCity").value;
            var st = document.getElementById('<%= drpSt.ClientID %>').value;
            var zip = document.getElementById("inputZip").value;
            var phone = document.getElementById("inputPhone").value;
            var fax = document.getElementById("inputFax").value;
            var contact = document.getElementById("inputContact").value;
            var disabled = document.getElementById("inputDisabled").checked;

            var par = "";
            par += "{";
            par += "  storenumber: " + storenum;
            par += ", storename: '" + Base64.encode(storename) + "'";
            par += ", address1: '" + Base64.encode(address1) + "'";
            par += ", address2: '" + Base64.encode(address2) + "'";
            par += ", city: '" + Base64.encode(city) + "'";
            par += ", st: '" + Base64.encode(st) + "'";
            par += ", zip: '" + Base64.encode(zip) + "'";
            par += ", phoneareacode: '" + null + "'";
            par += ", phonemain: '" + Base64.encode(phone) + "'";
            par += ", fax: '" + Base64.encode(fax) + "'";
            par += ", contact: '" + Base64.encode(contact) + "'";
            par += ", disabled: '" + disabled + "'";
            par += ", territory: '" + Base64.encode(territory) + "'";
            par += ", territorySupervisor: '" + Base64.encode(supervisor) + "'";
            par += "}";

            $.ajax({
                type: "POST",
                async: false,
                url: "forceoneData.asmx/AddStore",
                data: par,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.d <= 0) {
                        setAlert('Store has already been added to the system!', 'alert alert-warning', 'Alert: ');
                    }
                    else {
                        setAlert('Successfully added <b>Chain</b>: ' + storename + '<b>Store #</b>: ' + storeid + '!', 'alert alert-success', 'Add: ');
                    }
                },
                error: AjaxFailed
            });
        }

        function UpdateStoreInfo(storeid) {
            var storename = document.getElementById("drpChainsChoice").value;
            var storenum = document.getElementById("inputStoreNumber").value;
            var territory = document.getElementById('<%= drpTerritoryName.ClientID %>').value;
            var supervisor = document.getElementById('<%= drpTerritoryManager.ClientID %>').value;
            var address1 = document.getElementById("inputAddress1").value;
            var address2 = document.getElementById("inputAddress2").value;
            var city = document.getElementById("inputCity").value;
            var st = document.getElementById('<%= drpSt.ClientID %>').value;
            var zip = document.getElementById("inputZip").value;
            var phone = document.getElementById("inputPhone").value;
            var fax = document.getElementById("inputFax").value;
            var contact = document.getElementById("inputContact").value;
            var disabled = document.getElementById("inputDisabled").checked;

            var par = "";
            par += "{";
            par += "  StoreID:" + storeid;
            par += ", storenumber: " + storenum;
            par += ", storename: '" + Base64.encode(storename) + "'";
            par += ", address1: '" + Base64.encode(address1) + "'";
            par += ", address2: '" + Base64.encode(address2) + "'";
            par += ", city: '" + Base64.encode(city) + "'";
            par += ", st: '" + Base64.encode(st) + "'";
            par += ", zip: '" + Base64.encode(zip) + "'";
            par += ", phoneareacode: '" + null + "'";
            par += ", phonemain: '" + Base64.encode(phone) + "'";
            par += ", fax: '" + Base64.encode(fax) + "'";
            par += ", contact: '" + Base64.encode(contact) + "'";
            par += ", disabled: '" + disabled + "'";
            par += ", territory: '" + Base64.encode(territory) + "'";
            par += ", territorySupervisor: '" + Base64.encode(supervisor) + "'";
            par += "}";

            $.ajax({
                type: "POST",
                async: false,
                url: "forceoneData.asmx/UpdateStore",
                data: par,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.d <= 0) {
                        if(storeid > 0)
                            setAlert('No Changes were made to <b>StoreID</b>: ' + storeid + '!', 'alert alert-warning', 'Alert: ');
                        else 
                            setAlert('No Changes were made, please provide more info!', 'alert alert-warning', 'Alert: ');
                    }
                    else {
                        setAlert('Successfully updated <b>StoreID</b>: ' + storeid + '!', 'alert alert-success', 'Update: ');
                    }
                },
                error: AjaxFailed
            });
        }

        /* --- Utility --- */
        function clearInput() {
            var storeid = document.getElementById("inputStoreID");
            var storename = document.getElementById("drpChainsChoice");
            var storenum = document.getElementById("inputStoreNumber");
            var territory = document.getElementById('<%= drpTerritoryName.ClientID %>');
                    var supervisor = document.getElementById('<%= drpTerritoryManager.ClientID %>');
            var address1 = document.getElementById("inputAddress1");
            var address2 = document.getElementById("inputAddress2");
            var city = document.getElementById("inputCity");
                    var st = document.getElementById('<%= drpSt.ClientID %>');
                    var zip = document.getElementById("inputZip");
                    var phone = document.getElementById("inputPhone");
                    var fax = document.getElementById("inputFax");
                    var contact = document.getElementById("inputContact");
                    var disabled = document.getElementById("inputDisabled");

                    $(storeid).val('');
                    $(storename).val('');
                    $(storenum).val('');
                    $(territory).val('');
                    $(supervisor).val('');
                    $(address1).val('');
                    $(address2).val('');
                    $(city).val('');
                    $(st).val('');
                    $(zip).val('');
                    $(phone).val('');
                    $(fax).val('');
                    $(contact).val('');
                    $(disabled).prop("checked", false);

                    setNormal(storename);
                    setNormal(storenum);
                    setNormal(territory);
                    setNormal(supervisor);
                    setNormal(address1);
                    setNormal(address2);
                    setNormal(city);
                    setNormal(st);
                    setNormal(zip);
                    setNormal(phone);
                    setNormal(fax);
                    setNormal(contact);
                    setNormal(disabled);
                    setNormal(storeid);

                    setAlert("", "", "");
                    setAlert2("", "", "");
                }

        /* --- Validations --- */
        function checkStore(storeid) {
            var error = 0;
            if (storeid > 0) {
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "forceoneData.asmx/CheckStore",
                    data: "{ storeid: " + storeid + "}",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        var d = data.d;
                        if (d == 1) {
                            // storeid was good, you can update

                        }
                        else {
                            error++;
                        }
                    },
                    error: AjaxFailed
                });
            }
            var msg = '';
            var storename = document.getElementById("drpChainsChoice").value;
            var storenumber = document.getElementById("inputStoreNumber").value;
            var territory = document.getElementById('<%= drpTerritoryName.ClientID %>').value;
                    var supervisor = document.getElementById('<%= drpTerritoryManager.ClientID %>').value;
            var address1 = document.getElementById("inputAddress1").value;
            var address2 = document.getElementById("inputAddress2").value;
            var city = document.getElementById("inputCity").value;
            var st = document.getElementById('<%= drpSt.ClientID %>').value;
            var zip = document.getElementById("inputZip").value;
            var phone = document.getElementById("inputPhone").value;
            var fax = document.getElementById("inputFax").value;
            var contact = document.getElementById("inputContact").value;
            var disabled = document.getElementById("inputDisabled").checked;

            var storename_id = document.getElementById("drpChainsChoice");
            var storenumber_id = document.getElementById("inputStoreNumber");
            var address1_id = document.getElementById("inputAddress1");
            var city_id = document.getElementById("inputCity");
                    var st_id = document.getElementById('<%= drpSt.ClientID %>');
                    var zip_id = document.getElementById("inputZip");

                    var chainid = getChainId(storename);
                    if (chainid <= 0) {
                        msg += "<b>Store Name</b>, "
                        setBad(storename_id);
                        error++;
                    } // CHAIN ID **REQUIRED**

                    // Store # **REQUIRED**
                    if (storenumber <= 0) {
                        msg += "<b>Store #</b>, "
                        setBad(storenumber_id);
                        error++;
                    }
                    // Address1 **REQUIRED**
                    if (address1 == '') {
                        msg += "<b>Address</b>, "
                        setBad(address1_id);
                        error++;
                    }
                    // city **REQUIRED**
                    if (city == '') {
                        msg += "<b>City</b>, "
                        setBad(city_id);
                        error++;
                    }
                    // st **REQUIRED**
                    if (st == '') {
                        msg += "<b>State</b>, "
                        setBad(st_id);
                        error++;
                    }
                    // zip **REQUIRED**
                    if (zip == '') {
                        msg += "<b>Zip</b> "
                        setBad(zip_id);
                        error++;
                    }
                    else if (checkZip() <= 0) {
                        msg += "and not a valid <b>Zip</b>"
                        setBad(zip_id);
                        error++;
                    }

                    if (error > 0) {
                        setAlert("<b>Missing " + error + "</b> required fields: " + msg + "!", "alert alert-danger", "Error: ");
                    }
                    return error;
                }
        function checkZip() {
            var zip = document.getElementById("inputZip").value;
            var cnt = 0;
            if (zip > 0) {
                $.ajax({
                    type: "POST",
                    async: false,
                    url: "forceoneData.asmx/CheckZip",
                    data: "{ zip: '" + Base64.encode(zip) + "'}",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data) {
                        cnt = data.d;
                    },
                    error: AjaxFailed
                });
            }
            return cnt;
        }
    </script>
</asp:Content>
<asp:Content ID="Content3" ContentPlaceHolderID="contentPlaceHolderPage" runat="server">
</asp:Content>
