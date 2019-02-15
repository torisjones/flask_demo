class NessieApi {
  constructor( ) {
    this.myHeader = new Headers();
    this.myHeader.append('Content-Type', 'application/json');
  }
  __handleErrors() {

  }
  deleteCall(url) {
    let options = {
      headers: this.myHeader,
      method: 'DELETE'
    };
    return fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        throw error;
      });
  }
  postCall(url, data) {
    let options = {
      headers: this.myHeader,
      method: 'POST',
      body: JSON.stringify(data),
    };
    return fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          throw res;
        } else {
          return res.json();
        }
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }
  patchCall(url, data) {
    let options = {
      headers: this.myHeader,
      method: 'PATCH',
      body: JSON.stringify(data),
    };
    return fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        throw error;
      });
  }
  putCall(url, data) {
    let options = {
      headers: this.myHeader,
      method: 'PUT',
      body: JSON.stringify(data),
    };
    return fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          throw res;
        } else {
          return res.json();
        }
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }
  getCall(url) {
    let options = {
      headers: this.myHeader
    };
    return fetch(url, options)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        return data;
      })
      .catch((error) => {
        throw error;
      });

  }

}

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

class CreateCustomer extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
    this.newCustomer = {
      first_name: '',
      last_name: '',
      address: {
        street_number: '',
        street_name: '',
        city: '',
        state: '',
        zip: ''
      }
    };
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = `<style>.label{width:100px;padding-top:10px}
</style><h3>Customer DetailsPage!</h3><div class="label">First Name:</div><input id="firstName"/><br><div class="label">Last Name:</div><input id="lastName"/><br><div class="label">Street Number:</div><input id="streetNumber"/><br><div class="label">Street Name:</div><input id="streetName"/><br><div class="label">City:</div><input id="city"/><br><div class="label">State:</div><input id="state"/><br><div class="label">Zip:</div><input id="zip"/><br><div class="horizontal-div"><button id="back">Back</button><button id="create">Save</button></div>`;
    this.firstName = this._shadowRoot.querySelector('#firstName');
    this.lastName = this._shadowRoot.querySelector('#lastName');
    this.streetNumber = this._shadowRoot.querySelector('#streetNumber');
    this.streetName = this._shadowRoot.querySelector('#streetName');
    this.city = this._shadowRoot.querySelector('#city');
    this.state = this._shadowRoot.querySelector('#state');
    this.zip = this._shadowRoot.querySelector('#zip');
    this.backButton = this._shadowRoot.querySelector('#back');
    this.createButton = this._shadowRoot.querySelector('#create');
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.firstName.addEventListener('change',this.updateCustomer.bind(this));
    this.lastName.addEventListener('change',this.updateCustomer.bind(this));
    this.streetNumber.addEventListener('change',this.updateCustomer.bind(this));
    this.streetName.addEventListener('change',this.updateCustomer.bind(this));
    this.city.addEventListener('change',this.updateCustomer.bind(this));
    this.state.addEventListener('change',this.updateCustomer.bind(this));
    this.zip.addEventListener('change',this.updateCustomer.bind(this));
    this.backButton.addEventListener('click',this.back.bind(this));
    this.createButton.addEventListener('click',this.__emitUpdateEvent.bind(this));
  }
  get data() {
    return this._data;
  }
  set data(_value){
    this._data = _value;
    this.newCustomer = _value;
    this.loadData();
  }
  updateCustomer(event){
    switch(event.currentTarget.getAttribute('id')){
      case 'firstName':
        this.newCustomer.first_name = event.currentTarget.value;
        break;
      case 'lastName':
        this.newCustomer.last_name = event.currentTarget.value;
        break;
      case 'streetNumber':
        this.newCustomer.address.street_number = event.currentTarget.value;
        break;
      case 'streetName':
        this.newCustomer.address.street_name = event.currentTarget.value;
        break;
      case 'city':
        this.newCustomer.address.city = event.currentTarget.value;
        break;
      case 'state':
        this.newCustomer.address.state = event.currentTarget.value;
        break;
      case 'zip':
        this.newCustomer.address.zip = event.currentTarget.value;
        break;
    }
  }
  loadData(){
    this.firstName.value = this.data.first_name;
    this.lastName.value = this.data.last_name;
    this.streetNumber.value = this.data.address.street_number;
    this.streetName.value = this.data.address.street_name;
    this.city.value = this.data.address.city;
    this.state.value = this.data.address.state;
    this.zip.value = this.data.address.zip;
  }
  back(){
    console.log('back');
    this.dispatchEvent(new CustomEvent('back'));
  }
  __emitUpdateEvent(){
    console.log('create customer');
    console.log(this.newCustomer);
    this.dispatchEvent(new CustomEvent('create-customer',{detail:this.newCustomer}));
  }
}
if(!customElements.get('create-customer')){
  customElements.define('create-customer', CreateCustomer);
}

class ManageCustomers extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = `<style>.container{padding-bottom:20px}
</style><h3>Manage Customers Page!</h3><div id="customerDiv"></div><div class="horizontal-div"><button id="back">Back</button><button id="delete">Delete</button></div>`;
    this.backButton = this._shadowRoot.querySelector('#back');
    this.deleteButton = this._shadowRoot.querySelector('#delete');
    this.customerDiv = this._shadowRoot.querySelector('#customerDiv');
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.backButton.addEventListener('click',this.back.bind(this));
  }
  get customers(){
    return this._customers;
  }
  set customers(_value){
    this._customers = _value;
    this.__buildCustomers();
  }
  __buildCustomers(){
    this.customers.forEach((customer)=>{
      let customerContainer = document.createElement('div');
      customerContainer.setAttribute('class','container');
      customerContainer.innerHTML = `<div class='name'>${customer.first_name} ${customer.last_name}</div>
        <div class="addressLine1">${customer.address.street_number} ${customer.address.street_name}</div>
        <div class="addressLine2">${customer.address.city}, ${customer.address.state} ${customer.address.zip}</div>
        <button id="${customer._id}" class="edit-button">Edit Customer Details</button>`;
      this.customerDiv.appendChild(customerContainer);
    });
    this.customerDiv.querySelectorAll('.edit-button').forEach((button)=>{
      button.addEventListener('click',this.__editCustomer.bind(this));
    });
  }

  back(){
    console.log('back');
    this.dispatchEvent(new CustomEvent('back'));
  }
  __deleteCustomer(event){
    console.log('inside delete customer');
    console.log(event.currentTarget.getAttribute('id'));
  }
  __editCustomer(event){
    console.log('inside edit customer');
    console.log(event.currentTarget.getAttribute('id'));
    let id = event.currentTarget.getAttribute('id');
    this.__emitUpdateEvent({type:'edit',id:id});
  }
  __emitUpdateEvent(event){
    this.dispatchEvent(new CustomEvent('manage-customers',{detail:event}));
  }
}
if(!customElements.get('manage-customers')){
  customElements.define('manage-customers', ManageCustomers);
}
