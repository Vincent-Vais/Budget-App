// BUDGET CONTROLLER
let budgetController = (function(){
    
    const Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.pctg = -1;
    };

    Expense.prototype.calcPctg = function(totalInc){
        if(totalInc > 0){
            this.pctg = Math.round(this.value / totalInc * 100);
        }else{
            this.pctg = -1;
        }
    }

    Expense.prototype.getPctg = function(){
        return this.pctg;
    }

    const Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

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
    };

    const calculateTotal = function(type){
        let sum;

        sum = 0;
        data.allItems[type].forEach(item => {
            sum += item.value ;
        });
        data.totals[type] = sum;
    };

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
        deleteItem: function(type, id){
            data.allItems[type] = data.allItems[type].filter(item => {
                return item.id !== id ; 
            });
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
        calculatePctgs: function(){
            let totalIncome;

            totalIncome = data.totals.inc;
            console.log(totalIncome);
            data.allItems.exp.forEach(item => {
                item.calcPctg(totalIncome);
            });
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                pctg: data.pctg
            }
        },
        getPctgs: function(){
            let allPctgs;

            allPctgs = data.allItems.exp.map(item => {
                return item.getPctg();
            });
            return allPctgs;
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
        pctgLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPctgLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    const formatNumber = function(num, type){
        let numSplit, intPart, decPart, beforeComa, numOfComas, secondPart, i;
        num = Math.abs(num);
        num = num.toFixed(2); // becomes a string here
        numSplit = num.split(".");
        intPart = numSplit[0];
        beforeComa = intPart.length % 3;
        numOfComas = Math.floor(intPart.length / 3);
        secondPart = "" ;
        i = 0;
        while(numOfComas > 0){
            secondPart +=  ',' + intPart.substring(beforeComa + i, beforeComa + i + 3);
            i += 3;
            numOfComas--;
        }
        intPart = intPart.substring(0, beforeComa) + secondPart;
        decPart = numSplit[1];
        return (type === "exp" ? '-' : "+") + ' ' + intPart.replace(/(^,)/g, "") + "." + decPart ;
    };

    const nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

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
                html = `<div class="item clearfix" id="inc-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, type)}</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
                element = DOMstrings.incomeContainer;
            }else if(type === "exp"){
                html = `<div class="item clearfix" id="exp-${obj.id}">
                            <div class="item__description">${obj.description}</div>
                            <div class="right clearfix">
                                <div class="item__value">${formatNumber(obj.value, type)}</div>
                                <div class="item__percentage">21%</div>
                                <div class="item__delete">
                                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                                </div>
                            </div>
                        </div>`
                element = DOMstrings.expensesContainer;
            }
            // 2. Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", html);
        },
        deleteListItem : function(selectorID){
            let element, parent;

            element = document.getElementById(selectorID);
            parent = element.parentNode;
            parent.removeChild(element);
        },
        clearFields: function(){
            let fields, fieldsArray;
            fields = document.querySelectorAll([DOMstrings.inputDescription, DOMstrings.inputValue]);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(field => {
                field.value = "";
            });
            fieldsArray[0].focus();
        },
        displayBudget: function(obj){
            let type = obj.budget < 0 ? "exp" : "inc";
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, "exp");
            if(obj.pctg > 0){
                document.querySelector(DOMstrings.pctgLabel).textContent = `${obj.pctg}%`;
            }else{
                document.querySelector(DOMstrings.pctgLabel).textContent = "---";
            }
        },
        displayPctgs: function(pctgs){
            let fields;

            fields = document.querySelectorAll(DOMstrings.expensesPctgLabel);

            nodeListForEach(fields, (field, index) => {
                field.textContent = pctgs[index] > 0 ? `${pctgs[index]}%` : '---';
            });
        },
        displayMonth: function(){
            let now, year, month, months;

            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
            document.querySelector(DOMstrings.dateLabel).textContent = `${months[month]} ${year}`;
        },
        getParent: function(target){
            let currentNode;

            currentNode = target;
            while(currentNode.parentNode){
                while(currentNode.parentNode && !currentNode.id){
                    currentNode = currentNode.parentNode;
                }
                if(currentNode.parentNode && (currentNode.id.includes("inc") || currentNode.id.includes("exp"))){
                    break
                }
            }
            return currentNode
           
        },
        changedType: function(){
            let fields = document.querySelectorAll([
                DOMstrings.inputType, DOMstrings.inputDescription, DOMstrings.inputValue
            ]);
            nodeListForEach(fields, (field)=>{
                field.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
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

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    }

    const updateBudget = function(){
        let budget;

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget from bdgtController
        budget = budgetCtrl.getBudget();
        // 3. Display the budget
        UICtrl.displayBudget(budget);
    };

    const updatePctgs = function(){
        let allPctgs;
        // 1. Calculate percentages
        budgetCtrl.calculatePctgs();
        // 2. Return the percentages from bdgtController
        allPctgs = budgetCtrl.getPctgs();
        // 3. Display the percantages
        UICtrl.displayPctgs(allPctgs);
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
            //6. Calculate and update the pctgs
            updatePctgs();
        }
    };

    const ctrlDeleteItem = function(event){
        let itemID, splitID, type, ID;
        // 1. Get the parent div of the item where the button was clicked
        itemID = UICtrl.getParent(event.target).id
        // 2. Get type and id of the item
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 3. Delete the item from the ds
            budgetCtrl.deleteItem(type, ID);
            // 4. Delete the item from the DOM
            UICtrl.deleteListItem(itemID);
            // 5. Update and show the budget
            updateBudget();
            //6. Calculate and update the pctgs
            updatePctgs();
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
            UIController.displayMonth();
        }
    }

})(budgetController, UIController);

controller.init();