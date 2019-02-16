import {NessieApi} from "../utils/nessie-api";

class FlaskDemoRoute extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this.api = new NessieApi();
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = tempHtml;
    this.pageDiv = this._shadowRoot.querySelector('#pageDiv');
    this.errorDiv = this._shadowRoot.querySelector('.error');
    this.__getCustomers();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
  }
  
  //--------------------------------------------------------------------------------------------------------------------
  // api calls ---------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // Customer endpoints
  __getCustomers(){
    this.api.getCall('/customers').then((data)=>{
      this.customerList = data;
      this.__loadManageCustomersPage();
    }).catch((error)=>{
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __getCustomerById(id) {
    this.api.getCall(`/customers/${id}`).then((data)=>{
      this.__loadCreateCustomerPage(data);
    }).catch((error)=>{
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __updateCustomer(event){
    if(event.detail._id){
      this.api.putCall(`/customers/${event.detail._id}`,event.detail).then(()=>{
        this.__getCustomers();
      }).catch((error)=>{
        console.log(error);
        this.errorDiv.innerHTML = JSON.stringify(error);
      })
    } else {
      this.api.postCall('/customers',event.detail).then(()=>{
        this.__getCustomers();
      }).catch((error)=>{
        console.log(error);
        this.errorDiv.innerHTML = JSON.stringify(error);
      });
    }
  }
  
  // Account Endpoints
  __getAccounts(id) {
    this.__loadAccountsPage();
    this.api.getCall(`/customers/${id}/accounts`).then((data)=>{
      this.__loadAccountsPage(data,id);
    }).catch((error)=>{
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __updateAccount(event){
    let acctId = event.detail.acctId;
    let custId = event.detail.custId;
    let body = event.detail.body;
    switch(event.detail.type){
      case 'update':
        this.api.putCall(`/accounts/${acctId}`,{nickname:body})
          .catch((error)=>{
            console.log(error);
            this.errorDiv.innerHTML = JSON.stringify(error.statusText);
          });
        break;
      case 'remove':
        this.api.deleteCall(`/accounts/${acctId}`).then(()=>{
          this.__getAccounts(custId);
        }).catch((error)=>{
          this.__getAccounts(custId);
          console.log(error);
          this.errorDiv.innerHTML = JSON.stringify(error);
        });
        break;
      case 'create':
        this.api.postCall(`/customers/${custId}/accounts`,body).then(()=>{
          this.__getAccounts(custId);
        }).catch((error)=>{
          console.log(error);
          this.errorDiv.innerHTML = JSON.stringify(error.statusText);
        });
        break;
    }
  }

  //--------------------------------------------------------------------------------------------------------------------
  // routing functions -------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  __loadCreateCustomerPage(customer){
    this.pageDiv.innerHTML = '<create-customer></create-customer>';
    this.errorDiv.innerHTML = '';
    if(customer && customer.address){this.pageDiv.querySelector('create-customer').data = customer; }
    this.pageDiv.querySelector('create-customer').addEventListener('back',this.__getCustomers.bind(this));
    this.pageDiv.querySelector('create-customer').addEventListener('create-customer',this.__updateCustomer.bind(this));
  }
  __loadManageCustomersPage(){
    this.pageDiv.innerHTML = '<manage-customers></manage-customers>';
    this.errorDiv.innerHTML = '';
    this.pageDiv.querySelector('manage-customers').customers = this.customerList;
    this.pageDiv.querySelector('manage-customers').addEventListener('manage-customers',this.manageCustomersCall.bind(this));
  }
  manageCustomersCall(event){
    switch (event.detail.type) {
      case 'edit':
        this.__getCustomerById(event.detail.id);
        break;
      case 'accounts':
        this.__getAccounts(event.detail.id);
        break;
      case 'create':
        this.__loadCreateCustomerPage();
        break;
    }
  }
  __loadAccountsPage(accounts,customerId){
    this.pageDiv.innerHTML = '<customer-accounts-page></customer-accounts-page>';
    this.errorDiv.innerHTML = '';
    this.pageDiv.querySelector('customer-accounts-page').accounts = accounts;
    this.pageDiv.querySelector('customer-accounts-page').customerId = customerId;
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('update-account',this.__updateAccount.bind(this));
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('customers',this.__getCustomers.bind(this));
  }
}
if(!customElements.get('flask-demo-route')){
  customElements.define('flask-demo-route', FlaskDemoRoute);
}
