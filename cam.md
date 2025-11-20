Bring Campaigns to Telnyx
In this article, we're breaking down shared campaigns, and showing you how to use them within your Telnyx account.

Telnyx Engineering avatar
Written by Telnyx Engineering
Updated over 2 weeks ago
Campaigns Explained
Note: Using Shared Campaigns limits the ability of Telnyx to troubleshoot issues with your 10DLC campaigns and throughput. In most cases, we recommend creating your brands and campaigns through the Telnyx portal.

 

What is a Shared Campaign?
A shared campaign is a campaign that is registered directly through The Campaign Registry, instead of being created directly through your Telnyx account. In shared campaigns, a connectivity partner (CNP) is selected to provide messaging services.

 

If you're bringing a shared campaign to Telnyx from the Campaign Registry, Telnyx acts as an upstream connectivity partner (upstream CNP) for your campaign. In this situation, your organization is referred to as the downstream connectivity partner (downstream CNP). Telnyx in turn shares the campaign with mobile network operators (MNOs), who are referred to as the upstream CNPs for Telnyx.

 

Shared Campaign diagram. 
 

How do I import my campaigns from The Campaign Registry to a Connectivity Partner? 
To import campaigns from the Campaign Registry to an upstream connectivity partner (in this case, Telnyx), you must first provide your CSP ID to Telnyx. Your CSP ID is an identifier set by the Campaign Registry and can be found in your Campaign Registry CSP Portal. You should share this ID with your account manager or support representative, or send an email to support@telnyx.com. Our team will get to work and notify you when your CSP ID has been associated with your Telnyx account. This usually takes up to two business days to complete. 

 

Once you have received confirmation that your CSP ID has been successfully associated with your Telnyx account, you're ready to start importing campaigns.

 

In the Campaign Registry CSP Portal, choose the campaign you'd like to share and select Telnyx as the connectivity partner. This step automatically submits a request to the Telnyx team to review and approve your Shared Campaign. After Telnyx has reviewed and approved your Shared Campaign, Telnyx will show as the connectivity partner for the campaign in your Campaign Registry CSP Portal.

 

How do I add Telnyx numbers to shared campaigns?
Once you've verified that Telnyx is the connectivity partner for your Shared Campaign, you're ready to start assigning Telnyx numbers to your Shared Campaign.

 

At present, the only way to associate Telnyx numbers with Shared Campaigns is by using the Bulk Phone Number Campaigns endpoint of the Telnyx API. Before making this API request, you should first ensure all of the numbers you wish to add to the shared campaign are associated with the same Messaging Profile in your Telnyx account. You'll need the ID of that Messaging Profile, which you can find in the portal or by API. You'll also need the TCR ID of your shared campaign, which you can find in the Campaign Registry CSP Portal.

 

Once you've made this API request to associate numbers from a Messaging Profile with a Shared Campaign, you can check the status of the entire request or individual numbers via the Telnyx API.

 

 

Frequently Asked Questions about Shared Campaigns and 10DLC
How can I update my TCR Brand / Campaign through the Telnyx portal? 

You cannot update shared campaigns through the Telnyx portal. All brand and campaign information associated with Shared Campaigns can be maintained directly through your Campaign Registry CSP Portal. Telnyx, as the messaging service provider for the Shared Campaign, has limited visibility into the details of the campaign and corresponding brand.

 

Can I edit my campaign sharing request?

Once your organization has submitted a Shared Campaign by selecting Telnyx as the upstream CNP, and while the sharing status is in the PENDING state, your organization (as the downstream CNP) cannot rescind the sharing request nor change the upstream CNP.

10DLC Shared Campaigns
Register your campaigns directly with the Campaign Registry and import them to your Telnyx account.

Telnyx Engineering avatar
Written by Telnyx Engineering
Updated over 8 months ago
In this article, we're breaking down shared campaigns, and showing you how to use them within your Telnyx account. 

 

Note: Using Shared Campaigns limits the ability of Telnyx to troubleshoot issues with your 10DLC campaigns and throughput. In most cases, we recommend creating your brands and campaigns through the Telnyx portal.

 

What is a Shared Campaign?
A shared campaign is a campaign that is registered directly through The Campaign Registry, instead of being created directly through your Telnyx account. In shared campaigns, a connectivity partner (CNP) is selected to provide messaging services.

 

If you're bringing a shared campaign to Telnyx from the Campaign Registry, Telnyx acts as an upstream connectivity partner (upstream CNP) for your campaign. In this situation, your organization is referred to as the downstream connectivity partner (downstream CNP). Telnyx in turn shares the campaign with mobile network operators (MNOs), who are referred to as the upstream CNPs for Telnyx.

 

A pictorial representation of Telnyx as an upstream connectivity partner (upstream CNP) for your campaign. 
 

 

How to import campaigns from The Campaign Registry to a Connectivity Partner 
To import campaigns from the Campaign Registry to an upstream connectivity partner (in this case, Telnyx), you must first provide your CSP ID to Telnyx. Your CSP ID is an identifier set by the Campaign Registry and can be found in your Campaign Registry CSP Portal. You should share this ID with your account manager or support representative, or send an email to support@telnyx.com. Our team will get to work and notify you when your CSP ID has been associated with your Telnyx account. This process usually takes up to two business days to complete.

 

Once you have received confirmation that your CSP ID has been successfully associated with your Telnyx account, you're ready to start importing campaigns.

 

In the Campaign Registry CSP Portal, choose the campaign you'd like to share and select Telnyx as the connectivity partner. This step automatically submits a request to the Telnyx team to review and approve your Shared Campaign. After Telnyx has reviewed and approved your Shared Campaign, Telnyx will show as the connectivity partner for the campaign in your Campaign Registry CSP Portal.

 

How to add Telnyx numbers to shared campaigns
Once you've verified that Telnyx is the connectivity partner for your Shared Campaign, you're ready to start assigning Telnyx numbers to your Shared Campaign.

 

At present, the only way to associate Telnyx numbers with Shared Campaigns is by using the Bulk Phone Number Campaigns endpoint of the Telnyx API. Before making this API request, you should first ensure all of the numbers you wish to add to the shared campaign are associated with the same Messaging Profile in your Telnyx account. You'll need the ID of that Messaging Profile, which you can find in the portal or by API. You'll also need the TCR ID of your shared campaign, which you can find in the Campaign Registry CSP Portal.

 

Once you've made this API request to associate numbers from a Messaging Profile with a Shared Campaign, you can check the status of the entire request or individual numbers via the Telnyx API.

 

 

Frequently Asked Questions about Shared Campaigns and 10DLC
What is the Telnyx CSP Id: SS4XJ6D

 

How can I update my TCR Brand / Campaign through the Telnyx portal? 
You cannot update shared campaigns through the Telnyx portal. All brand and campaign information associated with Shared Campaigns can be maintained directly through your Campaign Registry CSP Portal. Telnyx, as the messaging service provider for the Shared Campaign, has limited visibility into the details of the campaign and corresponding brand.

 

Can I edit my campaign sharing request?
Once your organization has submitted a Shared Campaign by selecting Telnyx as the upstream CNP, and while the sharing status is in the PENDING state, your organization (as the downstream CNP) cannot rescind the sharing request nor change the upstream CNP.

10DLC Campaign Suspended
10DLC Campaign Suspension

K
Written by Klane Pedrie
Updated over a week ago
Why is my 10DLC / TCR Campaign Suspended?
If you see that your campaign has a TCR status of "Suspended" that normally means that it is dormant from inactivity. The solution normally is assigning phone numbers to the campaign twice. The first time the campaign will reactivate and the number assignment will fail. The second time the number assignment will work. The reason for this is that T-Mobile charges a $250 per month fine for campaigns they deem as inactive so we proactively put campaigns in a suspended state before they get hit with the fine.

 

10DLC Campaign Suspension for Inactivity - Customer Guide

 

  Overview

 

  To help customers avoid T-Mobile fines and maintain campaign compliance, Telnyx has implemented an automatic campaign suspension system for inactive 10DLC campaigns. This guide explains how it works and what actions customers should take.

  How It Works

  Automatic Suspension Triggers

  Your 10DLC campaign will be automatically suspended if all of these conditions are met:

✅ No activity for 15 consecutive days
✅ No active phone numbers assigned to the campaign  
✅ Campaign is currently deployed with T-Mobile

  Important: This is a protective measure to prevent carrier fines for dormant campaigns.

  New Webhook Notification

  Real-Time Alerts

Using these commands you can enable a webhook event when there is a suspension:


Campaigns created in the Telnyx Portal or API: Update My Campaign API | Telnyx or you can go to the campaign's page in the portal and update the webhook field or set it when you first create the campaign using the webhook field on a new campaign submission.

Campaigns created in the TCR Portal or API: Update Single Shared Campaign API | Telnyx

 

  When your campaign is suspended due to inactivity, you will receive a webhook
  notification (if configured) with the following information:

  {     "campaignId": "your-campaign-id",     "type": "TELNYX_EVENT",     "status": "DORMANT",     "description": "Campaign has been marked as dormant"   }

  Action Required: When you receive this notification, you should immediately take steps to reactivate your campaign (see below).

  How to Prevent Suspension

  Best Practices

Keep phone numbers assigned  (Numbers should be added with T-Mobile) - Maintain at least one active phone number on your campaign

Monitor usage - Regularly review your campaign activity

Set up webhooks - Configure webhook URLs in your campaign settings to receive real-time alerts

Plan ahead - If you know a campaign will be inactive, consider sending some traffic periodically.

  How to Reactivate a Suspended Campaign

  If your campaign has been suspended, follow these steps to reactivate it:

  Step 1: Assign Phone Numbers

Add or reassign phone numbers to your suspended campaign

Use the Create New Phone Number Campaign API | Telnyx  or Mission Control Portal

  Step 2: Resume the Campaign

The system will automatically attempt to resume your campaign when you assign numbers

Allow 1-2 minutes for processing

The first number assignment will fail but should unsuspend the campaign

  Step 3: Verify Activation

Check your campaign status via the API or Mission Control Portal

Status should change from TCR_SUSPENDED back to active

Once the campaign is active you should be able to assign numbers now so that a suspension does not happen again.

  Troubleshooting

  "I've tried reassigning numbers twice but it's not working"

  If standard reactivation doesn't work, try these steps:

  Option 1: Wait and Retry

The system uses automatic retry intervals: 1 minute → 10 minutes → 1 hour

Wait for the full retry cycle before attempting again

  Option 2: Manual Process

Remove all phone numbers from the campaign

Wait 2-3 minutes

Re-add phone numbers to the campaign

Monitor for confirmation webhook

  Option 3: Contact Support

  If you've tried the above and your campaign is still suspended:

  Contact Telnyx Support (Support@telnyx.com) with:

Campaign ID

TCR Campaign ID (if available)

Timestamp of when you attempted reactivation

Any error messages received

  Our support team can:

Check for carrier-level issues

Verify campaign status with T-Mobile

Manually trigger reactivation if needed

Review your account for billing or compliance issues

  Important Notes

  Why This Matters

Avoid Carrier Fines: T-Mobile charges fees for inactive campaigns

Maintain Compliance: Dormant campaigns may impact your sender reputation

Cost Management: Suspended campaigns help you avoid unnecessary charges

  Billing Impact

Suspended campaigns may affect your monthly billing

Review your campaign costs regularly

Deactivate campaigns you no longer need instead of leaving them inactive

  Campaign Monitoring

  We recommend:

Setting up webhook notifications for all campaigns

Regularly reviewing campaign activity (at least weekly)

Keeping documentation of which campaigns are actively in use

Frequently Asked Questions

  Q: How often does the system check for inactive campaigns? A: The system runs daily to identify and suspend inactive campaigns.

  Q: Will I receive a warning before suspension? A: If you have webhooks configured,
  you'll receive a notification when suspension occurs. We recommend monitoring your campaigns regularly.

  Q: Can I prevent my campaign from being suspended? A: Yes, keep at least one active phone number assigned to your campaign.

  Q: Is there a fee to reactivate a suspended campaign? A: No, reactivation is free.
  However, leaving campaigns dormant may result in carrier fees.

  Q: What happens to my messages during suspension? A: Messages sent from a suspended
  campaign may be blocked or rejected by carriers.

  Q: How long does reactivation take? A: Typically 1-5 minutes after reassigning phone
  numbers.

  Support

  For additional assistance, please contact:

Telnyx Support Portal: Telnyx Help Center

Email: support@telnyx.com

If you are unsure if the campaign was ever approved please reach out to 10dlcquestions@telnyx.com. 

How to assign a number to a campaign
Assigning numbers to your campaign is the third step to becoming compliant with 10DLC rules. Read on to learn how you can do this.

Telnyx Sales avatar
Written by Telnyx Sales
Updated over a year ago
How to assign a number to a campaign
Once you’ve set up your campaign, you need to assign a number(s) to it. Note that this guide assumes you have set up an SMS-capable phone number with Telnyx already. If you haven’t done so, you need to either purchase or port one first.

 

Important notes about assignment:

A number can only be associated to one campaign, but a campaign can have up to 49 numbers

The 49 number maximum is due to T-Mobile limitations

If you wish to exceed this maximum, you must complete a T-Mobile Number Pool Request form, incurring additional charges. Telnyx Support can help you with this process. Further details on this topic here.

 

Assigning a number via the Mission Control Portal

Follow these steps to assign a number in the portal. If you’d prefer to complete this step via the API, you can find details on how to do that in our API documentation.

Navigate to the Campaigns page on the Portal

Select the Campaign you wish to assign Phone Numbers to. You will be redirected to the Campaign Details page.

Navigate to the Assign Numbers panel.

Select the Messaging Profile the number is associated with, or select individual numbers to assign to said profile.

Select the number you wish to assign the campaign to