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
