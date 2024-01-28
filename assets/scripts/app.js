class DOMHelper {
  static clearEvnetLis(element) {
    //to make sure that we won't acuumalte eventlisners over time , avoid memory leak
    const clonedElement = element.cloneNode(true); //true to make it deep clone
    element.replaceWith(clonedElement);
    return clonedElement;
  }
  static moveElement(elementId, newDestSelector) {
    const element = document.getElementById(elementId);
    const destElement = document.querySelector(newDestSelector);
    destElement.append(element);
    //here the dom node will not be copied , it will  be moved because it is already a part of the Dom
    element.scrollIntoView({ behavior: "smooth" });
  }
}
/*************************************************************************************************** */

class Component {
  //this class is related to control a parts of the DOM
  //this class provides a convenient way to manage the attachment and detachment of DOM elements
  //with flexibility in insertion position
  constructor(hostElementId, insertBefore = false) {
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }
    this.insertBefore = insertBefore;
  }
  detach = () => {
    console.log(this.element);
    if (this.element) {
      this.element.remove();
    }
  };

  attach() {
    //document.body.append(this.element);
    this.hostElement.insertAdjacentElement(
      this.insertBefore ? "afterbegin" : "beforeend",
      this.element
    );
  }
}

/*************************************************************************************************** */
class ToolTip extends Component {
  constructor(closeNotiferFunction, toolTipInfo, hostElementId) {
    super(hostElementId); //super with no values means the deafult adding to the body
    this.closeNotifer = closeNotiferFunction;
    this.toolTipText = toolTipInfo;
    this.render();
  }
  closeToolTip = () => {
    this.detach();
    this.closeNotifer();
  };
  render() {
    console.log("The ToolTip ...");
    const toolEl = document.createElement("div");
    toolEl.className = "card";
    //toolEl.textContent = this.toolTipText;
    //using template and insert code into the html template tag using js
    const tooltipTemplate = document.getElementById("tooltip"); //it is a part of the Dom so we can query it and use it but it is not rendered
    console.log(tooltipTemplate);
    const tooltipBody = document.importNode(tooltipTemplate.content, true);
    tooltipBody.querySelector("p").textContent = this.toolTipText;
    toolEl.append(tooltipBody);

    console.log(this.hostElement.getBoundingClientRect());
    //(x,y) coordinate :

    const hostElLeft = this.hostElement.offsetLeft; //x ===left left :38.40625
    const hostElTop = this.hostElement.offsetTop; //y  ==top: 205
    const hosetElHeight = this.hostElement.clientHeight; //height
    const parentElScrolling = this.hostElement.parentElement.scrollTop;
    console.log(parentElScrolling);
    const x = hostElLeft + 20;
    const y = hostElTop + hosetElHeight - parentElScrolling - 10;

    //toolEl.textContent = "DUMMY!!!";
    toolEl.style.position = "absolute";
    toolEl.style.left = x + "px";
    toolEl.style.top = y + "px";
    toolEl.addEventListener("click", this.closeToolTip);
    this.element = toolEl;
  }
}
/*************************************************************************************************** */
//implement the structure
class Item {
  hasActiveToolTip = false;
  constructor(id, updateProjectListFunction, type) {
    this.id = id;
    this.updateProjectListHandler = updateProjectListFunction;
    this.swithcBtnHandler(type);
    this.moreInfoBtnHandler();
  }
  swithcBtnHandler(type) {
    const itemEl = document.getElementById(this.id);
    let switchBtn = itemEl.querySelector("button:last-of-type");
    switchBtn = DOMHelper.clearEvnetLis(switchBtn); //this always clears any existing eventlisners
    switchBtn.textContent = type === "active" ? "finish" : "activate";
    console.log(switchBtn);
    switchBtn.addEventListener(
      "click",
      this.updateProjectListHandler.bind(null, this.id)
    );
  }
  //The update method is designed to update the updateProjectListHandler property and refresh the "switch" button handler.
  update(updateProjectFun, type) {
    this.updateProjectListHandler = updateProjectFun;
    this.swithcBtnHandler(type);
  }
  infoHandler() {
    if (this.hasActiveToolTip) {
      return;
    }
    this.hasActiveToolTip = true; // this to make sure that the tooltip will not show more than once
    //access the custom data attributes:
    const projectElement = document.getElementById(this.id);
    console.log(projectElement.dataset);
    const toolTipText = projectElement.dataset.extraInfo;
    console.log(toolTipText);
    //adding new custon data attribute
    projectElement.dataset.newInfo = "Test";
    const tooltip = new ToolTip(
      () => {
        this.hasActiveToolTip = false;
      },
      toolTipText,
      this.id
    );
    tooltip.attach();
  }
  moreInfoBtnHandler() {
    const itemEl = document.getElementById(this.id);
    const infoBtn = itemEl.querySelector("button:first-of-type");
    console.log(infoBtn);
    infoBtn.addEventListener("click", this.infoHandler.bind(this));
  }
}
/*************************************************************************************************** */
//for handling list of items(projects)
class ListItems {
  items = [];
  constructor(type) {
    this.type = type;
    const list = document.querySelectorAll(`#${this.type}-projects li`);
    console.log(list);
    for (const item of list) {
      this.items.push(
        new Item(item.id, this.switchProject.bind(this), this.type)
      );
    }
    console.log(this.items);
  }
  setSwitchHandlerFunction(switchHandlerFunction) {
    //it accepts an argument then we store the callbackfunction argument into a property
    this.switchHandler = switchHandlerFunction;
  }
  addProject(project) {
    console.log(this);
    this.items.push(project); // moved the item from array in instance A to array in instance B
    DOMHelper.moveElement(project.id, `#${this.type}-projects ul`); //to move the actual Dom Node
    //update method:1- update the button caption  //2- update the eventlistner
    //pass our new switchHandler
    project.update(this.switchProject.bind(this), this.type);
  }
  switchProject(projectId) {
    this.switchHandler(this.items.find((e) => e.id === projectId));
    // const projectIndex = this.items.findIndex(e => e.id === projectId);
    // this.items.splice(projectIndex, 1);
    this.items = this.items.filter((p) => p.id !== projectId);
  }
}
/*************************************************************************************************** */
class App {
  static init() {
    const activeList = new ListItems("active");
    const finishedList = new ListItems("finished");
    activeList.setSwitchHandlerFunction(
      finishedList.addProject.bind(finishedList)
    );
    finishedList.setSwitchHandlerFunction(
      activeList.addProject.bind(activeList)
    );
    // const helloScript = document.createElement("script");
    // helloScript.textContent = 'alert("Hello there :)");';
    // document.head.append(helloScript);
    this.startAnalytics();
    //this.time= setInterval(this.startAnalytics, 1000);

    //setTimeout(this.startAnalytics, 3000);
    // Get various parts of the URL
    
  }
  static startAnalytics() {
    const analyticScript = document.createElement("script");
    analyticScript.src = "assets/scripts/analytics.js";
    analyticScript.defer = true;
    document.head.append(analyticScript);
  }
}

App.init();
