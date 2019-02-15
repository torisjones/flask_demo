class ManageCustomers extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = tempHtml;
    this.backButton = this._shadowRoot.querySelector('#back');
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
        <button id="${customer._id}" class="edit-button">Edit Customer Details</button>
        <button id="${customer._id}" class="accounts">View Customer Accounts</button>`;
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
    console.log('back');
    this.dispatchEvent(new CustomEvent('back'));
  }
  __editCustomer(event){
    console.log('inside edit customer');
    console.log(event.currentTarget.getAttribute('id'));
    let id = event.currentTarget.getAttribute('id');
    this.__emitUpdateEvent({type:'edit',id:id});
  }
  __customerAccounts(event){
    console.log('inside accounts');
    console.log(event.currentTarget.getAttribute('id'));
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
