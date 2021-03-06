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
    this._shadowRoot.innerHTML = `<style>button{padding:10px;margin:10px;border-radius:5px;width:150px}.create{background-color:seagreen;color:white}.manage{background-color:midnightblue;color:white}.regressive{background-color:darkred;color:white}.neutral-button{background-color:dimgrey;color:white}#pageDiv{font-family:sans-serif}h1{font-family:sans-serif}.error{color:darkred}
</style><h1>Nessie Flask!</h1><div class="error"></div><div id="pageDiv"></div>`;
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
  __getCustomers(){
    this.api.getCall('/customers').then((data)=>{
      this.customerList = data;
      this.__manageCustomers();
    }).catch((error)=>{
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __createCustomer(customer){
    this.pageDiv.innerHTML = '<create-customer></create-customer>';
    this.errorDiv.innerHTML = '';
    if(customer && customer.address){this.pageDiv.querySelector('create-customer').data = customer; }
    this.pageDiv.querySelector('create-customer').addEventListener('back',this.__getCustomers.bind(this));
    this.pageDiv.querySelector('create-customer').addEventListener('create-customer',this.createCustomerCall.bind(this));
  }
  createCustomerCall(event){
    if(event.detail._id){
      this.api.putCall(`/customers/${event.detail._id}`,event.detail).then(()=>{
        this.__getCustomers();
      }).catch((error)=>{
        console.log(error);
        this.errorDiv.innerHTML = JSON.stringify(error);
      });
    } else {
      this.api.postCall('/customers',event.detail).then(()=>{
        this.__getCustomers();
      }).catch((error)=>{
        console.log(error);
        this.errorDiv.innerHTML = JSON.stringify(error);
      });
    }
  }
  __manageCustomers(){
    this.pageDiv.innerHTML = '<manage-customers></manage-customers>';
    this.errorDiv.innerHTML = '';
    this.pageDiv.querySelector('manage-customers').customers = this.customerList;
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
      case 'create':
        this.__createCustomer();
        break;
    }
  }
  __editCustomer(id) {
    this.api.getCall(`/customers/${id}`).then((data)=>{
      this.__createCustomer(data);
    }).catch((error)=>{
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __getAccounts(id) {
    this.__viewAccounts();
    this.api.getCall(`/customers/${id}/accounts`).then((data)=>{
      this.__viewAccounts(data,id);
    }).catch((error)=>{
      console.log(error);
      this.errorDiv.innerHTML = JSON.stringify(error);
    });
  }
  __viewAccounts(accounts,customerId){
    this.pageDiv.innerHTML = '<customer-accounts-page></customer-accounts-page>';
    this.errorDiv.innerHTML = '';
    this.pageDiv.querySelector('customer-accounts-page').accounts = accounts;
    this.pageDiv.querySelector('customer-accounts-page').customerId = customerId;
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('update-account',this.__updateAccount.bind(this));
    this.pageDiv.querySelector('customer-accounts-page').addEventListener('customers',this.__getCustomers.bind(this));
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
    this._shadowRoot.innerHTML = `<style>.label{width:200px;padding-top:10px}button{padding:10px;margin:10px;border-radius:5px;width:150px}.create{background-color:seagreen;color:white}.manage{background-color:midnightblue;color:white}.regressive{background-color:darkred;color:white}.neutral-button{background-color:dimgrey;color:white}input{padding:5px;width:200px}
</style><h3>Customer DetailsPage!</h3><div class="label">First Name:</div><input id="firstName"/><br><div class="label">Last Name:</div><input id="lastName"/><br><div class="label">Street Number:</div><input id="streetNumber"/><br><div class="label">Street Name:</div><input id="streetName"/><br><div class="label">City:</div><input id="city"/><br><div class="label">State:</div><input id="state"/><br><div class="label">Zip:</div><input id="zip"/><br><div class="horizontal-div"><button id="back" class="neutral-button">Home</button><button id="create" class="create">Save</button></div>`;
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
    if(this.newCustomer){
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
      }
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
    this.dispatchEvent(new CustomEvent('back'));
  }
  __emitUpdateEvent(){
    console.log('here');
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
    this._shadowRoot.innerHTML = `<style>.container{margin-bottom:20px;border:solid;width:350px;padding-top:10px}button{padding:10px;margin:10px;border-radius:5px;width:150px}.create{background-color:seagreen;color:white}.manage{background-color:midnightblue;color:white}.regressive{background-color:darkred;color:white}.neutral-button{background-color:dimgrey;color:white}.customer{padding-left:20px;width:350px}
</style><h3>Manage Customers Page!</h3><button id="newCustomer" class="create">New Customer</button><div id="customerDiv"></div><!--<div class="horizontal-div">--><!--<button id="back" class="neutral-button">Home</button>--><!--</div>-->`;
    // this.backButton = this._shadowRoot.querySelector('#back');
    this.customerDiv = this._shadowRoot.querySelector('#customerDiv');
    this.createCustomerButton = this._shadowRoot.querySelector('#newCustomer');
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.createCustomerButton.addEventListener('click',this.__createCustomer.bind(this));
    // this.backButton.addEventListener('click',this.back.bind(this));
  }
  get customers(){
    return this._customers;
  }
  set customers(_value){
    this._customers = _value;
    if(_value){
      this.__buildCustomers();
    }
  }
  __buildCustomers(){
    this.customers.forEach((customer)=>{
      let customerContainer = document.createElement('div');
      customerContainer.setAttribute('class','container');
      customerContainer.innerHTML = `<div class="customer"><div class='name'>${customer.first_name || ''} ${customer.last_name || ''}</div>
        <div class="addressLine1">${customer.address.street_number|| ''} ${customer.address.street_name|| ''}</div>
        <div class="addressLine2">${customer.address.city || ''}, ${customer.address.state || ''} ${customer.address.zip || ''}</div>
        </div><button id="${customer._id}" class="edit-button create">Edit Customer Details</button>
        <button id="${customer._id}" class="accounts manage">Customer Accounts</button>`;
      this.customerDiv.appendChild(customerContainer);
    });
    this.customerDiv.querySelectorAll('.edit-button').forEach((button)=>{
      button.addEventListener('click',this.__editCustomer.bind(this));
    });
    this.customerDiv.querySelectorAll('.accounts').forEach((button)=>{
      button.addEventListener('click',this.__customerAccounts.bind(this));
    });
  }
  back(){
    this.dispatchEvent(new CustomEvent('back'));
  }
  __createCustomer(){
    this.__emitUpdateEvent({type:'create'});
  }
  __editCustomer(event){
    let id = event.currentTarget.getAttribute('id');
    this.__emitUpdateEvent({type:'edit',id:id});
  }
  __customerAccounts(event){
    let id = event.currentTarget.getAttribute('id');
    this.__emitUpdateEvent({type:'accounts',id:id});
  }
  __emitUpdateEvent(event){
    this.dispatchEvent(new CustomEvent('manage-customers',{detail:event}));
  }
}
if(!customElements.get('manage-customers')){
  customElements.define('manage-customers', ManageCustomers);
}

class CustomerAccountsPage extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = `<style>.horizontal-div{display:flex}.label{padding-right:20px;width:70px}.hidden{display:none}button{padding:10px;margin:10px;border-radius:5px;width:150px}.create{background-color:seagreen;color:white}.manage{background-color:midnightblue;color:white}.regressive{background-color:darkred;color:white}.neutral-button{background-color:dimgrey;color:white}.container{margin-bottom:20px;border:solid;width:350px;padding-top:10px}.account{padding-left:20px;width:350px}
</style><h3>Customer Accounts!</h3><div id="manageAccounts"><button id="createAccount" class="create">Create Account</button><div id="accounts"></div><div class="horizontal-div"><button id="customers" class="manage">Manage Customers</button></div></div><div id="createAccountDiv" class="hidden"><div class="horizontal-div"><div class="label">Nickname:</div><div class='name'><input id="nickname"/></div></div><div class="horizontal-div"><div class="label">Type:</div><div class="type"><input id="type"/></div></div><div class="horizontal-div"><div class="label">Rewards:</div><div class="rewards"><input id="rewards"/></div></div><div class="horizontal-div"><div class="label">Balance:</div><div class="balance"><input id="balance"/></div></div><button class="backAccountButton manage">Back to Accounts</button><button class="create-button create">Create Account</button></div>`;
    this.accountsDiv = this._shadowRoot.querySelector('#accounts');
    this.customerButton = this._shadowRoot.querySelector('#customers');
    this.createAccountDiv = this._shadowRoot.querySelector('#createAccountDiv');
    this.createAccountButton = this._shadowRoot.querySelector('#createAccount');
    this.manageAccountsDiv = this._shadowRoot.querySelector('#manageAccounts');
    this.createButton = this._shadowRoot.querySelector('.create-button');
    this.backAccountButton = this._shadowRoot.querySelector('.backAccountButton');
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.backAccountButton.addEventListener('click',this.__viewManageAccounts.bind(this));
    this.customerButton.addEventListener('click',this.manageCustomers.bind(this));
    this.createAccountButton.addEventListener('click',this.__viewCreateAccount.bind(this));
    this.createButton.addEventListener('click',this.__createAccount.bind(this));
  }
  get accounts() {
    return this._accounts;
  }
  set accounts(_value){
    this._accounts = _value;
    if(_value){
      this.loadData();
    }
  }
  get customerId() {
    return this._customerId;
  }
  set customerId(_value){
    this._customerId = _value;
  }
  loadData(){
    this.accounts.forEach((account)=>{
      let accountContainer = document.createElement('div');
      accountContainer.setAttribute('class','container');
      accountContainer.innerHTML = `<div class="account"><div class="horizontal-div"><div class="label">Nickname:</div>
        <div class='name'><input data="${account._id}" value="${account.nickname}" /></div></div>
        <div class="horizontal-div"><div class="label">Type:</div><div class="type">${account.type}</div></div>
        <div class="horizontal-div"><div class="label">Rewards:</div><div class="rewards">${account.rewards}</div></div>
        <div class="horizontal-div"><div class="label">Balance:</div><div class="balance">${account.balance}</div></div>
        </div><button id="${account._id}" class="save-button create">Update Account Name</button>
        <button id="${account._id}" class="delete-button regressive">Delete Account</button>`;
      this.accountsDiv.appendChild(accountContainer);
    });
    this.accountsDiv.querySelectorAll('.save-button').forEach((button)=>{
      button.addEventListener('click',this.__emitUpdateEvent.bind(this));
    });
    this.accountsDiv.querySelectorAll('.delete-button').forEach((button)=>{
      button.addEventListener('click',this.__emitRemoveEvent.bind(this));
    });
    if(this.accounts.length === 0){
      this.accountsDiv.innerHTML = 'No accounts yet.';
    }
  }
  __clearData(){
    this.createAccountDiv.querySelectorAll('input').forEach((input)=>{
      input.value = '';
    });
  }
  __createAccount(){
    let body = {};
    let acctId = new Date().valueOf();
    this.createAccountDiv.querySelectorAll('input').forEach((input)=>{
      input.getAttribute('id') !== 'balance' && input.getAttribute('id') !== 'rewards' ?
        body[input.getAttribute('id')] = input.value :
        body[input.getAttribute('id')] = parseInt(input.value);
    });
    body['account_number'] = acctId.toString();
    this.dispatchEvent(new CustomEvent('update-account',{detail:{type:'create',custId:this.customerId,body:body}}));
    this.__clearData();
  }
  __viewCreateAccount(){
    this.manageAccountsDiv.setAttribute('class','hidden');
    this.createAccountDiv.removeAttribute('class');
  }
  __viewManageAccounts(){
    this.createAccountDiv.setAttribute('class','hidden');
    this.manageAccountsDiv.removeAttribute('class');
    this.__clearData();
  }
  back(){
    this.dispatchEvent(new CustomEvent('back'));
  }
  manageCustomers(){
    this.dispatchEvent(new CustomEvent('customers'));
  }
  __emitUpdateEvent(event){
    let id = event.currentTarget.getAttribute('id');
    let nickname = this.accountsDiv.querySelector(`input[data="${id}"]`).value;
    this.dispatchEvent(new CustomEvent('update-account',{detail:{type:'update',acctId:id, body:nickname}}));
  }
  __emitRemoveEvent(event){
    let id = event.currentTarget.getAttribute('id');
    this.dispatchEvent(new CustomEvent('update-account',{detail:{type:'remove',acctId:id,custId:this.customerId}}));
  }
}
if(!customElements.get('customer-accounts-page')){
  customElements.define('customer-accounts-page', CustomerAccountsPage);
}
