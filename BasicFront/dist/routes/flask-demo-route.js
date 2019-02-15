import {NessieApi} from "../utils/nessie-api";

class FlaskDemoRoute extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this.api = new NessieApi();
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = `<style></style><h1>Nessie Flask!</h1><div id="pageDiv"><button id="newCustomer">New Customer</button><br><button id="manageCustomers">Manage Customers</button></div>`;
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
    this.pageDiv.innerHTML = '<button id="newCustomer">New Customer</button>\n' +
      '  <br>\n' +
      '  <button id="manageCustomers">Manage Customers</button>';
    this.__addEventListeners();
  }
  __getCustomers(){
    this.api.getCall('/customers?key=6122e0b7dd9cf10ce7cb1135ac481e90').then((data)=>{
      console.log('customers');
      console.log(data);
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
    console.log('inside create customer on route');
    console.log(event.detail);
    // TODO: actually make call to flask app
    if(event.detail._id){
      //TODO make put call
      console.log('inside make put call');
      // this.api.putCall()
    } else {
      //TODO make post call
      console.log('inside make post call');
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
    console.log('inside manage customer on route');
    console.log(event.detail);
    // TODO: actually make call to flask app
    switch (event.detail.type) {
      case 'edit':
        this.__editCustomer(event.detail.id);
        break;
      case 'accounts':
        break;
    }
    this.loadHomePage();
  }
  __editCustomer(id) {
    this.api.getCall(`/customers/${id}?key=6122e0b7dd9cf10ce7cb1135ac481e90`).then((data)=>{
      console.log('data');
      console.log(data);
      this.__createCustomer(data);
    }).catch((error)=>{
      console.log(error);
    });
  }
}
if(!customElements.get('flask-demo-route')){
  customElements.define('flask-demo-route', FlaskDemoRoute);
}