using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.IO;
using System.Data.SqlTypes;
using System.Net;
using ForceOne.UserControls;
using Azure;

namespace ForceOne
{
    public partial class task : ForceOneBaseClass
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            base.OnLoad(null);
            bool isNumeric = false;

            if (!IsPostBack)
            {
                int n;
                try
                {
                    if (Request.QueryString.Count > 0)
                        isNumeric = int.TryParse(Request.QueryString["idx"].ToString(), out n);
                }
                catch { isNumeric = false; }


                if (isNumeric)
                {
                    int idx = Int32.Parse(Request.QueryString["idx"].ToString());

                    //string dt = Request.QueryString["date"].ToString();

                    ForceOneDAL dal = new ForceOneDAL();
                    //List<vwschedule>scheds= dal.GetSchedulesByIDf_Date(idf, dt);
                    vwschedule sched = dal.GetScheduleByIDx(idx);
                    List<vwschedule> scheds = new List<vwschedule>();
                    scheds.Add(sched);

                    rptSchedules.DataSource = scheds;

                    rptSchedules.DataBind();

                    if (sched.idx > 0)
                    {
                        headertext.InnerText = "Schedule for " + sched.storename;

                    }
                    else
                    {
                        headertext.InnerText = "No Tasks Available";
                    }
                }
                else
                {
                    var path = "/jobentry.aspx";
                    Response.Redirect(path);
                }
            }
        }
        protected void rptSchedules_ItemDataBound(object sender, RepeaterItemEventArgs e)
        {
            if (e.Item.ItemType == ListItemType.Item || e.Item.ItemType == ListItemType.AlternatingItem)
            {
                try
                {
                    Button btn = (Button)e.Item.FindControl("btn");
                    if (btn != null)
                    {
                        btn.Visible = ((vwschedule)e.Item.DataItem).surveyv.Value;
                    }
                }
                catch { }

                try
                {
                    //LinkButton btn = (LinkButton)e.Item.FindControl("btnSurvey");

                    if (((vwschedule)e.Item.DataItem).surveyv.Value == false)
                    {
                        System.Web.UI.HtmlControls.HtmlGenericControl myDiv = (System.Web.UI.HtmlControls.HtmlGenericControl)e.Item.FindControl("divSurveyCheckIcon");
                        myDiv.Style["display"] = "none";


                        //if(btn!=null)
                        //{
                        //    btn.Visible = false;
                        //}
                    }
                    else
                    {
                        //if(btn!=null)
                        //{
                        //btn.OnClientClick= "window.location.href='surveyanswer.aspx?jobnum=" + ((vwschedule)e.Item.DataItem).jobnum.ToString() + "&idx=" + ((vwschedule)e.Item.DataItem).idx.ToString() + "'";
                        //btn.Attributes.Add("href", "surveyanswer.aspx?jobnum=" + ((vwschedule)e.Item.DataItem).jobnum.ToString() + "&idx=" + ((vwschedule)e.Item.DataItem).idx.ToString() + "");
                        //    btn.Visible = true;
                        //}
                    }
                }
                catch { }

                try
                {
                    if (((vwschedule)e.Item.DataItem).billtype.Value == 1 || ((vwschedule)e.Item.DataItem).mileagebillablerate == 0)//flat rate // or bill mileage cost is 0
                    {
                        System.Web.UI.HtmlControls.HtmlGenericControl myDiv = (System.Web.UI.HtmlControls.HtmlGenericControl)e.Item.FindControl("divMileage");
                        myDiv.Style["display"] = "none";
                    }
                }
                catch { }

                string timeexp = ((vwschedule)e.Item.DataItem).expectedtimein;

                Label lblRepName = (Label)e.Item.FindControl("lblRepName");
                if (lblRepName != null)
                {
                    try
                    {
                        ForceOneDAL dal = new ForceOneDAL();
                        System.Data.DataSet ds = dal.GetRep(int.Parse(((vwschedule)e.Item.DataItem).repnum.ToString()));
                        if (ds.Tables[0].Rows.Count > 0)
                        {
                            lblRepName.Text = ds.Tables[0].Rows[0]["FormattedName"].ToString();
                        }
                    }
                    catch
                    { }
                }

                Label lblexp = (Label)e.Item.FindControl("lblDate");
                Label lblStoreName = (Label)e.Item.FindControl("lblStoreName");
                lblStoreName.Text = ((vwschedule)e.Item.DataItem).storename + "<br />" + ((vwschedule)e.Item.DataItem).storeaddress;


                DateTime expectedDate = (DateTime)((vwschedule)e.Item.DataItem).dateschedule;
                string expTime = ((vwschedule)e.Item.DataItem).expectedtimein;

                lblexp.Text = expectedDate.ToShortDateString() + "  " + (fTime.HH(expTime)) + " : " + fTime.MM(expTime) + " " + fTime.TZ(expTime);

                TextBox txtTimeIn = (TextBox)e.Item.FindControl("txtTimeIn");
                TextBox txtTimeOut = (TextBox)e.Item.FindControl("txtTimeOut");
                TextBox txtMileage = (TextBox)e.Item.FindControl("txtMileage");

                Label lblTimeOut = (Label)e.Item.FindControl("lblTimeOut");

                Button btnClock = (Button)e.Item.FindControl("btnSave");

                DateTime timein = ((vwschedule)e.Item.DataItem).timein.HasValue ? (DateTime)((vwschedule)e.Item.DataItem).timein : DateTime.MinValue;
                DateTime timeout = ((vwschedule)e.Item.DataItem).timeout.HasValue ? (DateTime)((vwschedule)e.Item.DataItem).timeout : DateTime.MinValue;
                int coq = ((vwschedule)e.Item.DataItem).countofquestions.Value; // count of questions 
                int coa = ((vwschedule)e.Item.DataItem).countofanswers.Value; // count of answers
                bool isSurvey = ((vwschedule)e.Item.DataItem).surveyv.Value; // is survey

                if (coq == 0) // No questions in the survey yet
                {
                    System.Web.UI.HtmlControls.HtmlGenericControl myDiv = (System.Web.UI.HtmlControls.HtmlGenericControl)e.Item.FindControl("divSurveyCheckIcon");
                    myDiv.Style["display"] = "none";
                    myDiv.InnerText = "The survey attached doesn't have any questions yet.";
                    txtTimeOut.Visible = false;
                    lblTimeOut.Visible = false;
                    btnClock.Visible = false;
                }
                else if (coa < coq && isSurvey) // Survey in-progress
                {
                    System.Web.UI.HtmlControls.HtmlGenericControl myDiv = (System.Web.UI.HtmlControls.HtmlGenericControl)e.Item.FindControl("divSurveyCheckIcon");
                    myDiv.Style["display"] = "block";
                    myDiv.InnerText = "Survey is " + coa + " of " + coq + ".";
                    myDiv.Attributes["class"] = "alert alert-warning";
                    txtTimeOut.Visible = false;
                    lblTimeOut.Visible = false;
                    if (timein == DateTime.MinValue)
                    {
                        btnClock.Text = "Clock In";
                        btnClock.CommandName = "Clock-in";
                        btnClock.CssClass = "btn btn-success timeclock";
                        btnClock.Attributes.Add("disabled", "disabled");
                    }
                    else
                    {
                        btnClock.Enabled = true;
                        btnClock.CommandName = "Survey";
                    }

                }
                else if (coa >= coq && isSurvey) // Survey completed
                {
                    System.Web.UI.HtmlControls.HtmlGenericControl myDiv = (System.Web.UI.HtmlControls.HtmlGenericControl)e.Item.FindControl("divSurveyCheckIcon");
                    myDiv.Style["display"] = "block";
                    myDiv.InnerText = "Survey Complete!";
                    myDiv.Attributes["class"] = "alert alert-success";
                    txtTimeOut.Visible = true;
                    lblTimeOut.Visible = true;
                    if (timeout == DateTime.MinValue)
                    {
                        //txtTimeIn.Enabled = false;
                        btnClock.Text = "Clock Out";
                        btnClock.CommandName = "Clock-out";
                        btnClock.CssClass = "btn btn-success timeclock";
                        btnClock.Attributes.Add("disabled", "disabled");

                    }
                    else
                    {
                        //txtTimeIn.Enabled = false;
                        txtTimeOut.Enabled = true;
                        btnClock.Enabled = true;
                        btnClock.CommandName = "Survey";
                    }
                }
                else // Survy
                {
                    btnClock.Enabled = true;
                    // Not a survey
                }

                /* No longer necessary 5/17/2023 - NJS
                if ( !timeout.Equals(DateTime.MinValue) && !timein.Equals( DateTime.MinValue) && !IsPostBack)
                {
                    Label lblDays = (Label)e.Item.FindControl("lblDays");
                    Label lblHours = (Label)e.Item.FindControl("lblHours");
                    Label lblMinutes = (Label)e.Item.FindControl("lblMinutes");

                    TimeSpan t = timeout.Subtract(timein);

                    lblDays.Text = t.Days.ToString();
                    lblHours.Text = t.Hours.ToString();
                    lblMinutes.Text = t.Minutes.ToString();
                }
                */
                TimeSpan timeSpanin = new TimeSpan(timein.Hour, timein.Minute, timein.Second);
                TimeSpan timeSpanout = new TimeSpan(timeout.Hour, timeout.Minute, timeout.Second);
                if (timein > DateTime.MinValue)
                {
                    txtTimeIn.Text = timeSpanin.ToString();
                }

                if (timeout > DateTime.MinValue)
                {
                    txtTimeOut.Text = timeSpanout.ToString();
                }


                // If they have clocked in - Clock in



                /*
                 * 
                 * 
                 * 
                 * HiddenField hidsurveyv = (HiddenField)e.Item.FindControl("hidSurveyV");
                    if (bool.Parse(hidsurveyv.Value.ToString()))
                    {
                        Response.Redirect("surveyanswer.aspx?jobnum=" + hidJobNum.Value.ToString() + "&idx=" + idx.ToString());
                    }
                 * 
                 * 
                 */
                /*
                try
                {
                    if((drpTimeOutHH.Items.FindByText(Convert.ToString(fTime.HH(txtTimeIn.Text))))!= null) {
                        drpTimeInHH.Items.FindByText(Convert.ToString(fTime.HH(txtTimeIn.Text))).Selected = true;
                    } 
                }
                catch { }

                try
                {
                    if ((drpTimeInMM.Items.FindByText(Convert.ToString(fTime.MM(txtTimeIn.Text)))) != null) {
                        drpTimeInMM.Items.FindByText(Convert.ToString(fTime.MM(txtTimeIn.Text))).Selected = true;
                    }
                }
                catch
                {
                }

                try
                {
                    if ((drpTimeInAMPM.Items.FindByText(Convert.ToString(fTime.TZ(txtTimeIn.Text)))) != null) {
                        drpTimeInAMPM.Items.FindByText(Convert.ToString(fTime.TZ(txtTimeIn.Text))).Selected = true;
                    }
                }
                catch
                {
                }

                try
                {
                    if ((drpTimeOutHH.Items.FindByText(Convert.ToString(fTime.HH(txtTimeOut.Text)))) != null) {
                        drpTimeOutHH.Items.FindByText(Convert.ToString(fTime.HH(txtTimeOut.Text))).Selected = true;
                    }
                }
                catch { }

                try
                {
                    if ((drpTimeOutMM.Items.FindByText(Convert.ToString(fTime.MM(txtTimeOut.Text)))) != null) {
                        drpTimeOutMM.Items.FindByText(Convert.ToString(fTime.MM(txtTimeOut.Text))).Selected = true;
                    }
                }
                catch
                {
                }

                try
                {
                    if ((drpTimeOutAMPM.Items.FindByText(Convert.ToString(fTime.TZ(txtTimeOut.Text)))) != null){
                        drpTimeOutAMPM.Items.FindByText(Convert.ToString(fTime.TZ(txtTimeOut.Text))).Selected = true;
                    }
                }
                catch
                {
                }
                */
            }
        }
        void UploadPhoto(int jobnum, int idx, RepeaterCommandEventArgs e)
        {
            if (!Page.IsPostBack) { return; }
            UpdatePanel pnl = (UpdatePanel)e.Item.FindControl("UpdatePanel1");

            if (pnl != null)
            {
                Label lblStatus = (Label)e.Item.FindControl("lblStatus");
                FileUpload fileuploader = (FileUpload)pnl.FindControl("fileuploader");
                TextBox txtPhotoComment = (TextBox)pnl.FindControl("txtPhotoComment");
                lblStatus.Text = "";

                if (jobnum == 0)
                {
                    lblStatus.Text = "Job number is not setup.";
                    return;
                }
                if (idx == 0)
                {
                    lblStatus.Text = "IDx is not assigned.";
                    return;
                }

                if (fileuploader != null)
                {
                    if (fileuploader.HasFile)
                    {
                        try
                        {
                            if (fileuploader.PostedFile.ContentType == "image/jpeg" || fileuploader.PostedFile.ContentType == "image/pjpeg" || fileuploader.PostedFile.ContentType == "image/gif" || fileuploader.PostedFile.ContentType == "image/png" || fileuploader.PostedFile.ContentType == "image/bmp" || fileuploader.PostedFile.ContentType == "image/x-png" || fileuploader.PostedFile.ContentType == "image/jpg")
                            {
                                if (fileuploader.PostedFile.ContentLength < 15000000)//15000000 bytes - 15 mb
                                {
                                    string tempPath = "";
                                    tempPath = System.Configuration.ConfigurationManager.AppSettings["FolderPath"] + "/" + jobnum.ToString("000000");
                                    string filename = Path.GetFileName(fileuploader.PostedFile.FileName);

                                    string date = DateTime.Now.Year.ToString("0000") + DateTime.Now.Month.ToString("00") + DateTime.Now.Day.ToString("00") + DateTime.Now.Hour.ToString("00") + DateTime.Now.Minute.ToString("00") + DateTime.Now.Second.ToString("00") + DateTime.Now.Millisecond.ToString("0000");
                                    filename = idx.ToString("0000000000") + "_" + date + "_" + filename;

                                    filename = filename.Replace(":", "");

                                    using (var fs = fileuploader.PostedFile.InputStream)
                                    {
                                        AzureStorageClient.UploadFile($"{tempPath}/{filename}", fileuploader.PostedFile.ContentType, fs);
                                    }

                                    ForceOneDAL dal = new ForceOneDAL();
                                    dal.AddStorePhoto(jobnum, idx, filename, txtPhotoComment.Text);
                                    lblStatus.Text = "Photo was successfully uploaded.";
                                }
                                else
                                    lblStatus.Text = "Upload status: The file has to be less than 15 Mb!";
                            }
                            else
                                lblStatus.Text = "Upload status: Only JPEG files are accepted!";
                        }
                        catch (Exception ex)
                        {
                            lblStatus.Text = "Upload status: The file could not be uploaded. The following error occured: " + ex.Message;
                        }
                    }
                    else
                    {
                        lblStatus.Text = "No file to upload.";
                    }
                }
            }
        }
        protected void SaveShift(RepeaterCommandEventArgs e)
        {
            divError.InnerText = "";
            bool gotTimeOut = false;

            TextBox txtTimeIn = (TextBox)e.Item.FindControl("txtTimeIn");
            TextBox txtTimeOut = (TextBox)e.Item.FindControl("txtTimeOut");
            TextBox txtComment = (TextBox)e.Item.FindControl("txtComment");
            TextBox txtMileage = (TextBox)e.Item.FindControl("txtMileage");
            TextBox txtPayRate = (TextBox)e.Item.FindControl("txtPayRate");

            gotTimeOut = txtTimeOut.Text != "";


            HiddenField hidExpectedDate = (HiddenField)e.Item.FindControl("hidExpectedDate");
            HiddenField hidExpectedTimeIn = (HiddenField)e.Item.FindControl("hidExpectedTimeIn");
            HiddenField hididx = (HiddenField)e.Item.FindControl("hididx");
            HiddenField hidExpectedWorkHours = (HiddenField)e.Item.FindControl("hidExpectedWorkHours");
            HiddenField hidBillType = (HiddenField)e.Item.FindControl("hidBillType");
            HiddenField hididfJobStoreAssigned = (HiddenField)e.Item.FindControl("hididfJobStoreAssigned");
            HiddenField hidRepNum = (HiddenField)e.Item.FindControl("hidRepNum");
            HiddenField hidTotalExpectedHoursWork = (HiddenField)e.Item.FindControl("hidTotalExpectedHoursWork");
            HiddenField hidPayRate = (HiddenField)e.Item.FindControl("hidPayRate");
            HiddenField hidJobNum = (HiddenField)e.Item.FindControl("hidJobNum");
            HiddenField hidMiscExpense = (HiddenField)e.Item.FindControl("hidMiscExpense");
            HiddenField hidMiscExpenseReason = (HiddenField)e.Item.FindControl("hidMiscExpenseReason");
            string timeexpin = hidExpectedTimeIn.Value;  // ((vwschedule)e.Item.DataItem).expectedtimein;
            DateTime expectedDate = Convert.ToDateTime(hidExpectedDate.Value);
            DateTime timein = DateTime.Parse(expectedDate.ToShortDateString() + " " + txtTimeIn.Text);
            DateTime timeout = DateTime.Parse(expectedDate.ToShortDateString() + " " + txtTimeOut.Text);
            float expectedworkhours = hidExpectedWorkHours.Value.ToString() == "" ? 0 : int.Parse(hidExpectedWorkHours.Value.ToString());
            int billtype = hidBillType.Value.ToString() == "" ? 0 : Convert.ToInt32(hidBillType.Value);
            int idx = Convert.ToInt32(hididx.Value);
            int idfjobstoresassigned = Convert.ToInt32(hididfJobStoreAssigned.Value);

            TimeSpan diff = timeout.Subtract(timein);
            if (diff.TotalMinutes < 0)
            {
                timeout = timeout.AddDays(1);
                diff = timeout.Subtract(timein);
            }

            //if (timeout < timein)
            //{
            //    timeout = timeout.AddDays(1);
            //}

            if (expectedworkhours == 0)
            {
                expectedworkhours = 1;
            }
            else if (expectedworkhours == 1)
            {
                expectedworkhours = 1.75F;
            }

            if (gotTimeOut)//check time diff on time in / out if time out is provided
            {
                if (billtype == 2) //Hour Rate
                {
                    double hours = diff.TotalHours;
                    if (hours < 0)
                    {
                        divError.InnerText = "There's a problem with your start and end time.";
                        return;
                    }
                    else if (hours > expectedworkhours && txtComment.Text == "")
                    {
                        divError.InnerText = "Your hours went over the expected time. Please a comment below before you submit.";
                        return;
                    }
                    else
                    {
                        divError.InnerText = "";
                    }
                }
                else if (billtype == 1) //flat rate
                {
                    diff = timeout.Subtract(timein);
                    double hours = diff.TotalHours;
                    if (hours < 0)
                    {
                        divError.InnerText = "There's a problem with your start and end time.";
                        return;
                    }
                }
            }
            ForceOneDAL dal = new ForceOneDAL();
            int repnum = Convert.ToInt32(hidRepNum.Value);
            int i = 0;

            if (gotTimeOut)
            {
                i = dal.AddJobStoreSchedule(idfjobstoresassigned, repnum, expectedDate, timeexpin, timein, timeout, idx, txtComment.Text, float.Parse(txtMileage.Text), float.Parse(hidPayRate.Value), float.Parse(hidTotalExpectedHoursWork.Value), float.Parse(hidMiscExpense.Value), hidMiscExpenseReason.Value);
            }
            else
            {
                if (txtTimeIn.Text == "")
                {
                    i = dal.AddJobStoreSchedule(idfjobstoresassigned, repnum, expectedDate, timeexpin, null, null, idx, txtComment.Text, float.Parse(txtMileage.Text), float.Parse(hidPayRate.Value), float.Parse(hidTotalExpectedHoursWork.Value), float.Parse(hidMiscExpense.Value), hidMiscExpenseReason.Value);
                }
                else
                {
                    var ParsedIntMileage = 0;
                    int.TryParse(txtMileage.Text, out ParsedIntMileage);
                    i = dal.AddJobStoreSchedule(idfjobstoresassigned, repnum, expectedDate, timeexpin, timein, null, idx, txtComment.Text, ParsedIntMileage, float.Parse(hidPayRate.Value), float.Parse(hidTotalExpectedHoursWork.Value), float.Parse(hidMiscExpense.Value), hidMiscExpenseReason.Value);
                }
            }
        }
        protected void GoToSurvey(RepeaterCommandEventArgs e)
        {
            HiddenField hididx = (HiddenField)e.Item.FindControl("hididx");
            int idx = Convert.ToInt32(hididx.Value);
            HiddenField hidJobNum = (HiddenField)e.Item.FindControl("hidJobNum");


            ForceOneDAL dal = new ForceOneDAL();
            HiddenField hidsurveyv = (HiddenField)e.Item.FindControl("hidSurveyV");
            if (bool.Parse(hidsurveyv.Value.ToString()))
            {
                vwschedule sched = dal.GetScheduleByIDx(idx);
                int questnum = 0;
                int cntAns = (int)sched.countofanswers;
                int cntQues = (int)sched.countofquestions;
                try
                {
                    if (cntAns == cntQues)
                    {
                        questnum = cntAns;
                    }
                    else
                    {
                        questnum = cntAns + 1; //grab the latest answer
                    }

                }
                catch { }
                if (questnum == 0) { questnum = 1; } // 
                Response.Redirect("surveyanswer.aspx?jobnum=" + hidJobNum.Value.ToString() + "&idx=" + idx.ToString() + "&q=" + questnum.ToString());
            }
            else
            {
                //Response.Redirect("jobentry.aspx");
            }
        }

        protected void rptSchedules_ItemCommand(object source, RepeaterCommandEventArgs e)
        {
            if (e.CommandName == "Survey")
            {
                GoToSurvey(e);
            }
            else if (e.CommandName == "UploadPhoto")
            {
                HiddenField hidJobNum = (HiddenField)e.Item.FindControl("hidJobNum");
                HiddenField hididx = (HiddenField)e.Item.FindControl("hididx");
                HiddenField hidQuestNum = (HiddenField)e.Item.FindControl("hidQuestNum");

                if (hidJobNum != null && hididx != null)
                {
                    UploadPhoto(int.Parse(hidJobNum.Value.ToString()), int.Parse(hididx.Value.ToString()), e);
                }
            }
            else if (e.CommandName == "Clock-in")
            {
                SaveShift(e);
                System.Web.UI.HtmlControls.HtmlGenericControl myDiv = (System.Web.UI.HtmlControls.HtmlGenericControl)e.Item.FindControl("divSurveyCheckIcon");
                TextBox txtTimeIn = (TextBox)e.Item.FindControl("txtTimeIn");

                myDiv.InnerText = "Clock-in confirmed. Thank you!";

                txtTimeIn.Enabled= false;
                Button btnClock = (Button)e.Item.FindControl("btnSave");
                btnClock.Text = "To Survey";
                btnClock.CssClass = "btn btn-secondary timeclock";
                btnClock.CommandName = "Survey";
                btnClock.Enabled = true;
                btnClock.Attributes.Remove("disabled");
            }
            else if (e.CommandName == "Clock-out")
            {
                SaveShift(e);
                System.Web.UI.HtmlControls.HtmlGenericControl myDiv = (System.Web.UI.HtmlControls.HtmlGenericControl)e.Item.FindControl("divSurveyCheckIcon");
                TextBox txtTimeOut = (TextBox)e.Item.FindControl("txtTimeOut");

                myDiv.InnerText = "Clock-out confirmed. Thank you!";

                txtTimeOut.Enabled= false;
                Button btnClock = (Button)e.Item.FindControl("btnSave");
                btnClock.Text = "To Survey";
                btnClock.CssClass = "btn btn-secondary timeclock";
                btnClock.CommandName = "Survey";
                btnClock.Enabled = true;
                btnClock.Attributes.Remove("disabled");
            }
        }
    }
}
