class CustomerAccountsPage extends HTMLElement {
  constructor(){
    // If you define a constructor, always call super() first!
    // This is specific to CE and required by the spec.
    super();
    // This just gives you access to the shadowRoot for <customer-accounts-page></customer-accounts-page>
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = tempHtml;
    // Once the page builds, we initialize the html elements in customer-accounts-page.html so that we can readily
    // manipulate their attributes/properties
    this.accountsDiv = this._shadowRoot.querySelector('#accounts');
    this.customerButton = this._shadowRoot.querySelector('#customers');
    this.createAccountDiv = this._shadowRoot.querySelector('#createAccountDiv');
    this.createAccountButton = this._shadowRoot.querySelector('#createAccount');
    this.manageAccountsDiv = this._shadowRoot.querySelector('#manageAccounts');
    this.createButton = this._shadowRoot.querySelector('.create-button');
    this.backAccountButton = this._shadowRoot.querySelector('.backAccountButton');
    // Since these elements are interactive, typically you create a method called addEventListeners where you then
    // attach all the respective listeners.
    this.__addEventListeners();
  }
  disconnectedCallback(){

  }
  attributeChangedCallback(){

  }
  adoptedCallback(){

  }
  __addEventListeners(){
    this.backAccountButton.addEventListener('click',this.__viewManageAccounts.bind(this))
    this.customerButton.addEventListener('click',this.__emitManageCustomers.bind(this));
    this.createAccountButton.addEventListener('click',this.__viewCreateAccount.bind(this));
    this.createButton.addEventListener('click',this.__createAccount.bind(this));
  }
  //--------------------------------------------------------------------------------------------------------------------
  // Getters and Setters -----------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // More details on the getter/setter section in create-customer.js
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
  //--------------------------------------------------------------------------------------------------------------------
  // Manage Data -------------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
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
  //--------------------------------------------------------------------------------------------------------------------
  // Manage Div Visibility ---------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  // Manage which div you see -- mainly this is here because I was being lazy and didn't create a new page for create
  // account, so instead I just hid the HTML until you need it. In the scss, you can see that there is a class 'hidden'
  // defined to have { display: none }, which does what it sounds like, makes the div invisible. These two functions
  // just swap out which div has the attribute class="hidden"
  __viewCreateAccount(){
    this.manageAccountsDiv.setAttribute('class','hidden');
    this.createAccountDiv.removeAttribute('class');
  }
  __viewManageAccounts(){
    this.createAccountDiv.setAttribute('class','hidden');
    this.manageAccountsDiv.removeAttribute('class');
    this.__clearData();
  }
  //--------------------------------------------------------------------------------------------------------------------
  // Dispatch Events ---------------------------------------------------------------------------------------------------
  //--------------------------------------------------------------------------------------------------------------------
  __emitManageCustomers(){
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
