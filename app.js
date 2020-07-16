// BUDGET CONTROLLER
let budgetController = (function(){
    
    const Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    const Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        pctg : -1
    }

    const calculateTotal = function(type){
        let sum;

        sum = 0;
        data.allItems[type].forEach(item => {
            sum += item.value ;
        });
        data.totals[type] = sum;
    }

    return {
        addItem: function(type, des, val){
            let newItem, ID;
            // 1. Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            // 2. Create new item
            if(type === "exp"){
                newItem = new Expense(ID, des, val);
            }else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }else{
                console.log("Error");
            }  
            // 3. Push into ds
            data.allItems[type].push(newItem);
            // data.totals[type] += newItem.value;
            // 4. Return the new element
            return newItem;
        },
        calculateBudget: function(){
            // 1. Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            // 2. Budget = income - expenses
            data.budget = data.totals.inc - data.totals.exp; 
            // 3. Calculate percentage of income we already spent
            if(data.totals.inc){
                data.pctg = Math.round(data.totals.exp / data.totals.inc * 100);
            }
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                pctg: data.pctg
            }
        }
    }

})();

// UI CONTROLLER
let UIController = (function(){

    let DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        pctgLabel: ".budget__expenses--percentage"
    }

    return {
        getInput: function(){
            return{
                type : document.querySelector(DOMstrings.inputType).value, // Either "inc" or "exp"
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },
        getDOMstrings: function(){
            return DOMstrings;
        },
        addListItem: function(obj, type){
            let html, element;
            // 1. Create HTML string with values from recieved object
            if(type === "inc"){
                html = `<div class="item clearfix" id="income-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">+ ${obj.value}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
                element = DOMstrings.incomeContainer;
            }else if(type === "exp"){
                html = `<div class="item clearfix" id="expense-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">- ${obj.value}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
                element = DOMstrings.expensesContainer;
            }
            // 2. Insert HTML into the DOM
            console.log(element);
            document.querySelector(element).insertAdjacentHTML("beforeend", html);
        },
        clearFields: function(){
            let fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription, DOMstrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(field => {
                field.value = "";
            });
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            if(obj.pctg > 0){
                document.querySelector(DOMstrings.pctgLabel).textContent = `${obj.pctg}%`;
            }else{
                document.querySelector(DOMstrings.pctgLabel).textContent = "---";
            }
        }
    }
})();

// GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl, UICtrl){

    const setupEventListeners = function(){
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", (event) => {
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
    }

    const updateBudget = function(){
        let budget;

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        budget = budgetCtrl.getBudget();
        // 3. Display the budget
        UICtrl.displayBudget(budget);
    }

    const ctrlAddItem = function(){
        let input, newItem;

        // 1. Get field input data
        input = UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add a new item to UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. Calculate and update the budget
            updateBudget();
        }
    };

    return {
        init: function(){
            console.log("Application has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                pctg: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();