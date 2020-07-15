var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    Expense.prototype.calcPercentage = function(totalIncome){
        if (totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
   var data = {
    allItems: {
        exp: [],
        inc: []
    },
    totals: {
        exp: 0,
        inc: 0
    },
    budget: 0,
    percentage: -1
   };
   
   var calculateTotal = function (valuesArr){
        var sum = 0;
        valuesArr.forEach(function(current, index, array){
            sum += current.value;
        })
        return sum;
   }
   
   return {
        addItem: function(type, desc, value){
            var newItem, id;
            
            if (data.allItems[type].length > 0){
                id = data.allItems[type].length;
            } else {
                id = 0;
            }
            
            if (type === 'exp'){
                newItem = new Expense(id, desc, value);
            } else if (type === 'inc'){
                newItem = new Income(id, desc, value);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        testing: function(){
            console.log(data);
        },
        calculateBudget: function(){
            // calculate total inc and exp
            // calculate budget: income - expenses
            // calculate % of inc spent
            
            data.totals.inc = calculateTotal(data.allItems.inc);
            data.totals.exp = calculateTotal(data.allItems.exp);
        
            data.budget = data.totals.inc - data.totals.exp;
            
            if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100 );    
            } else {
                data.percentage = -1;
            }
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },
        deleteItem: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            index = ids.indexOf(id);
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        calculatePercentage: function(){
            data.allItems.exp.forEach(function(curr, index, arr){
                curr.calcPercentage(data.totals.inc);
            })
        },
        getPercentages: function(){
            var allPercents = data.allItems.exp.map(function(curr){
                return curr.getPercentage();
            });
            return allPercents;
        }
   }
})();


var UIController = (function(){
    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        allPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    var formatNumber = function(num, type){
        num = num.toFixed(2);
        
        // 23500.34
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3){
            int = int.substr(0, int.length-3) + ',' + int.substr(int.length-3, int.length);
        }
        var res = (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        
        return res;
    }

    return {
        getItem: function(){
            return {
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
                type: document.querySelector(DOMStrings.inputType).value
            };
        },
        getDOMStrings: function(){
            return DOMStrings;
        },
        addListItem: function(obj, type){
            // Create html string with some placeholder text
            // Replace the placeholder text with real data
            // Insert html into DOM
            
            var html, newHtml, element;
            
            if (type === 'inc'){
                element = DOMStrings.incomeContainer;
            
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> \
                <div class="right clearfix"><div class="item__value">%value%</div> <div class="item__delete">\
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
                </div></div></div>'
            } else if (type == 'exp'){
                element = DOMStrings.expensesContainer;
            
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div>\
                <div class="right clearfix">\
                    <div class="item__value">%value%</div>\
                    <div class="item__percentage">21%</div>\
                    <div class="item__delete">\
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>\
                    </div></div></div>'
            }
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        clearFields: function(){
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            // for (var i=0; i<fieldsArr.length; i++) {
            //     fieldsArr[i].value = "";
            // };
            // or
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function(obj){
            var type = (obj.budget > 0 ? type = 'inc' : type = 'exp');
        
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalIncome, 'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExpenses, 'exp');
            
            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + ' %';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        deleteListItem: function(selectorID){
            document.getElementById(selectorID).remove();
        },
        displayPercentages: function(allPercents){
            var fields = document.querySelectorAll(DOMStrings.allPercLabel);
            
            fields.forEach(function(curr, index){
                curr.textContent = allPercents[index];
            });
        },
        displayMonth: function(){
            var now, month, year, months;
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", 
                      "October", "November", "December"];
            
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();
            
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ', ' + year;
        },
        changedType: function(){
            var fields = document.querySelectorAll(DOMStrings.inputType + ',' + 
                        DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            fields.forEach(function(curr){
                curr.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputButton).classList.toggle('red');
        }
    }
    })();


var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputButton).addEventListener(
            'click', ctrlAddItem);
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).
        addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    var updateBudget = function(){
        // 1. Calculate the budget
        // 2. Return the budget
        // 3. Display the budget on the UI
        budgetCtrl.calculateBudget();
        
        var budget = budgetCtrl.getBudget();
        
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentage = function(){
        // 1. Calculate percentage
        // 2. Return the percentage
        // 3. Display the updated percentage on the UI
        
        budgetCtrl.calculatePercentage();
        
        var allPercents = budgetCtrl.getPercentages();
        
        // console.log("all percents", allPercents);
        UICtrl.displayPercentages(allPercents);

    }
        
    var ctrlAddItem = function(){
        // 1. Get the input data
        // 2. Add the item to budget controller
        // 3. Add the item to UI controller
        // 4. Calculate the budget
        // 5. Display the budget on UI
        
        var input, newItem;
    
        input = UICtrl.getItem();
        
        if (input.description !== "" && !isNaN(input.value)
            && input.value > 0){
            newItem = budgetCtrl.addItem(
                input.type, input.description, input.value);
                    
            UICtrl.addListItem(newItem, input.type);
            
            UICtrl.clearFields();
            
            updateBudget();
            
            updatePercentage();
        }
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID){
            splitID = itemID.split('-');
            
            type = splitID[0];
            ID = parseInt(splitID[1]);
        
            budgetCtrl.deleteItem(type, ID);
            UICtrl.deleteListItem(itemID);
            
            updateBudget();
            
            updatePercentage();
        }
    };
    
    return {
        init: function(){
            console.log("Application has started.");
            UICtrl.displayMonth();
            UICtrl.displayBudget(
                {
                    budget: 0,
                    totalIncome: 0,
                    totalExpenses: 0,
                    percentage: -1
                }
            )
            setupEventListeners();
        }
    }
    
})(budgetController, UIController);

controller.init();
