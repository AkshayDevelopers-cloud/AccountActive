import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { createRecord } from 'lightning/uiRecordApi';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import EMAIL_FIELD from '@salesforce/schema/Account.Company_Email__c';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import ACTIVE_FIELD from '@salesforce/schema/Account.Active_p__c';
import ACTIVATION_SUMMARY_FIELD from '@salesforce/schema/Account.Account_Activation_Summary__c';
import FIRST_NAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LAST_NAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_CONTACT_FIELD from '@salesforce/schema/Contact.Email';
import PHONE_CONTACT_FIELD from '@salesforce/schema/Contact.Phone';

export default class activateAccountButton extends LightningElement {
  @api recordId;
  message;
  displayMessage = false;

  @wire(getRecord, { recordId: '$recordId', fields: [ACTIVATION_SUMMARY_FIELD] })
  account;

  activateAccount() {
    const activationSummary = this.account.data.fields.Account_Activation_Summary__c.value;
    if (!activationSummary) {
      this.message = 'Please fill in the Account Activation Summary field.';
      this.displayMessage = true;
      return;
    }

    const fields = {};
    fields[ACTIVE_FIELD.fieldApiName] = true;
    const recordInput = { fields, id: this.recordId };

    createRecord(ACCOUNT_OBJECT, recordInput)
      .then(() => {
        const accountName = this.account.data.fields.Name.value;
        const email = this.account.data.fields.Company_Email__c.value;
        const phone = this.account.data.fields.Phone.value;
        const contactFields = {};
        contactFields[FIRST_NAME_FIELD.fieldApiName] = accountName;
        contactFields[LAST_NAME_FIELD.fieldApiName] = 'Customer Representative';
        contactFields[EMAIL_CONTACT_FIELD.fieldApiName] = email;
        contactFields[PHONE_CONTACT_FIELD.fieldApiName] = phone;
        const contactRecordInput = { apiName: CONTACT_OBJECT.objectApiName, fields: contactFields };
        return createRecord(contactRecordInput);
      })
      .then(() => {
        this.message = 'Account activated and contact record created successfully.';
        this.displayMessage = true;
      })
      .catch((error) => {
        console.log("RecordId"+this.recordId);
        this.message = `Error activating account: ${error.body.message}`;
        this.displayMessage = true;
      });
  }
}
