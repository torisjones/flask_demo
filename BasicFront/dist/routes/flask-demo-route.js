import {NessieApi} from "../utils/nessie-api";

class FlaskDemoRoute extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this.api = new NessieApi();
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = `<style>button{padding:10px;margin:10px;border-radius:5px;width:150px}.create{background-color:seagreen;color:white}.manage{background-color:midnightblue;color:white}.regressive{background-color:darkred;color:white}.neutral-button{background-color:dimgrey;color:white}#pageDiv{font-family:sans-serif}h1{font-family:sans-serif}
</style><h1>Nessie Flask!</h1><div id="pageDiv"><button id="newCustomer" class="create">New Customer</button><br><button id="manageCustomers" class="manage">Manage Customers</button></div>`;
    this.pageDiv = this._shadowRoot.querySelector('#pageDiv');
    this.__getCustomers();
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.createCustomerButton = this._shadowRoot.querySelector('#newCustomer');
    this.manageCustomersButton = this._shadowRoot.querySelector('#manageCustomers');
    this.createCustomerButton.addEventListener('click',this.__createCustomer.bind(this));
    this.manageCustomersButton.addEventListener('click',this.__manageCustomers.bind(this));
  }
  loadHomePage(){
    this.pageDiv.innerHTML = '<button id="newCustomer" class="create">New Customer</button>\n' +
      '  <br>\n' +
      '  <button id="manageCustomers" class="manage">Manage Customers</button>';
    this.__addEventListeners();
  }
  __getCustomers(){
    this.api.getCall('/customers?key=6122e0b7dd9cf10ce7cb1135ac481e90').then((data)=>{
      this.customerList = data;
    }).catch((error)=>{
      console.log(error);
    });
  }
  __createCustomer(customer){
    this.pageDiv.innerHTML = '<create-customer></create-customer>';
    if(customer.address){this.pageDiv.querySelector('create-customer').data = customer; }
    this.pageDiv.querySelector('create-customer').addEventListener('back',this.loadHomePage.bind(this));
    this.pageDiv.querySelector('create-customer').addEventListener('create-customer',this.createCustomerCall.bind(this));
  }
  createCustomerCall(event){
    if(event.detail._id){
      this.api.putCall(`/customers/${event.detail.id}?key=6122e0b7dd9cf10ce7cb1135ac481e90`,event.detail.address).catch((error)=>{
        console.log(error);
      })
    } else {
      this.api.postCall('/customers?key=6122e0b7dd9cf10ce7cb1135ac481e90',event.detail).then(()=>{
        this.__getCustomers();
      }).catch((error)=>{
        console.log(error);
      });
    }
    this.loadHomePage();
  }
  __manageCustomers(){
    this.pageDiv.innerHTML = '<manage-customers></manage-customers>';
    this.pageDiv.querySelector('manage-customers').customers = this.customerList;
    this.pageDiv.querySelector('manage-customers').addEventListener('back',this.loadHomePage.bind(this));
    this.pageDiv.querySelector('manage-customers').addEventListener('manage-customers',this.manageCustomersCall.bind(this));
  }
  manageCustomersCall(event){
    switch (event.detail.type) {
      case 'edit':
        this.__editCustomer(event.detail.id);
        break;
      case 'accounts':
        this.__getAccounts(event.detail.id);
        break;
    }
    this.loadHomePage();
  }
  __editCustomer(id) {
    this.api.getCall(`/customers/${id}?key=6122e0b7dd9cf10ce7cb1135ac481e90`).then((data)=>{
      this.__createCustomer(data);
    }).catch((error)=>{
      console.log(error);
    });
  }
  __getAccounts(id) {
    this.api.getCall(`/customers/${id}/accounts?key=6122e0b7dd9cf10ce7cb1135ac481e90`).then((data)=>{
      this.__viewAccounts(data,id);
    }).catch((error)=>{
      console.log(error);
    });
  }
  __viewAccounts(accounts,customerId){
    this.pageDiv.innerHTML = '<customer-accounts-page></customer-accounts-page>';
    this.pageDiv.querySelector('customer-accounts-page').accounts = accounts;
    this.pageDiv.querySelector('customer-accounts-page').customerId = customerId;
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('back',this.loadHomePage.bind(this));
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('update-account',this.__updateAccount.bind(this));
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('customers',this.__manageCustomers.bind(this));
  }
  __updateAccount(event){
    let acctId = event.detail.acctId;
    let custId = event.detail.custId;
    let body = event.detail.body;
    switch(event.detail.type){
      case 'update':
        this.api.putCall(`/accounts/${acctId}?key=6122e0b7dd9cf10ce7cb1135ac481e90`,{nickname:body})
          .catch((error)=>{
            console.log(error);
          });
        break;
      case 'remove':
        this.api.deleteCall(`/accounts/${acctId}?key=6122e0b7dd9cf10ce7cb1135ac481e90`).then(()=>{
          this.__getAccounts(custId);
        }).catch((error)=>{
          this.__getAccounts(custId);
          console.log(error);
        });
        break;
      case 'create':
        this.api.postCall(`/customers/${custId}/accounts?key=6122e0b7dd9cf10ce7cb1135ac481e90`,body).then(()=>{
          this.__getAccounts(custId);
        }).catch((error)=>{
          console.log(error);
        });
        break;
    }
  }
}
if(!customElements.get('flask-demo-route')){
  customElements.define('flask-demo-route', FlaskDemoRoute);
}
