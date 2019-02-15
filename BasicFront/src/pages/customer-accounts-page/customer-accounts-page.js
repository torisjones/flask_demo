class CustomerAccountsPage extends HTMLElement {
  constructor(){
    super();
    this._shadowRoot = this.attachShadow({mode: 'open'});
  }
  connectedCallback(){
    this._shadowRoot.innerHTML = tempHtml;
    // this.backButton = this._shadowRoot.querySelector('#back');
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
    // this.backButton.addEventListener('click',this.back.bind(this));
    this.backAccountButton.addEventListener('click',this.__viewManageAccounts.bind(this))
    this.customerButton.addEventListener('click',this.manageCustomers.bind(this));
    this.createAccountButton.addEventListener('click',this.__viewCreateAccount.bind(this));
    this.createButton.addEventListener('click',this.__createAccount.bind(this));
  }
  get accounts() {
    return this._accounts;
  }
  set accounts(_value){
    this._accounts = _value;
    this.loadData();
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
      accountContainer.innerHTML = `<div class="horizontal-div"><div class="label">Nickname:</div>
        <div class='name'><input data="${account._id}" value="${account.nickname}" /></div></div>
        <div class="horizontal-div"><div class="label">Type:</div><div class="type">${account.type}</div></div>
        <div class="horizontal-div"><div class="label">Rewards:</div><div class="rewards">${account.rewards}</div></div>
        <div class="horizontal-div"><div class="label">Balance:</div><div class="balance">${account.balance}</div></div>
        <button id="${account._id}" class="save-button">Update Account Name</button>
        <button id="${account._id}" class="delete-button">Delete Account</button>`;
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
    this.createAccountDiv.querySelectorAll('input').forEach((input)=>{
      input.getAttribute('id') !== 'balance' && input.getAttribute('id') !== 'rewards' ?
        body[input.getAttribute('id')] = input.value :
        body[input.getAttribute('id')] = parseInt(input.value);
    });
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
