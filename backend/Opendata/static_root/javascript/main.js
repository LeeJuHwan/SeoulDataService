const N = 300;

// 이건 뭐지
const gData = {
    nodes: [...Array(N).keys()].map(i => ({ id: i, adjacent_nodes: [] })),
    links: [...Array(N).keys()]
      .filter(id => id)
      .map(id => ({
        source: Math.round(Math.random() * (id - 1)),
        target: id
      }))
  };

  // 이건 또 뭐지
gData.links.forEach(link => {
    gData.nodes[link.source].adjacent_nodes.push(link.target);
    gData.nodes[link.target].adjacent_nodes.push(link.source);
});

// <div class = "graph"> 에 3D graph 생성
const graph_elem = document.querySelector(".graph")

// const Graph = ForceGraph3D()(graph_elem)
const Graph = ForceGraph3D()(graph_elem)
.jsonUrl("/web/node-coordinate/") 
.nodeLabel("name") // hover print
.nodeAutoColorBy("group")
.nodeResolution(100)
.onNodeDragEnd((node) => {
  node.fx = node.x;
  node.fy = node.y;
  node.fz = node.z;
  console.log("Coordinates: ", node.x, node.y, node.z);
});

// 데이터 정보 div 선택
var data_info_name = document.querySelector(".data_info > .content > span:nth-child(1) > .val")
var data_info_description = document.querySelector(".data_info > .content > span:nth-child(2) > .val")
var data_info_subdivision = document.querySelector(".data_info > .content > span:nth-child(3) > .val")
var data_info_type = document.querySelector(".data_info > .content > span:nth-child(4) > .val")
var data_info_URL = document.querySelector(".data_info > .content > span:nth-child(5) > .val")


// 유사 데이터 div 선택
var similar_data_content = document.querySelector(".similar_data > .content")

window.onload = function(){
    console.log(" window.onload | page 들어오면 실행되는 함수: ", gData)
    Graph.graphData(gData)
    Graph.onNodeClick(node => {
        select_node(node);
    })

    // search button click -> 검색창에 있는 value 찾아줌
    let search = document.querySelector(".search_button")
    search.addEventListener("click", (e) => {
        let search_target = document.querySelector(".search").value
        //console.log("search_target: ", search_target)
        search_node(parseInt(search_target))
    })
}

function select_node(node){
    console.log("function select_node | node 선택 : ", node)
    
    Checked(node)
    // get_adjacent_data(node)

    const distance = 400;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
        ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
        : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        1500  // ms transition duration
    );
}

function Checked(node) {
    console.log("function checked | server로 node ID 전송")
    nodeData = node.id;
    console.log("node ID: ", nodeData)
    const csrftoken = Cookies.get("csrftoken");
    
    fetch("/web/", {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"data": nodeData}),
    })
      .then((response) => response.json())
      .then((data) => {
        return data;
      })
      .then((jsonData) => {
        console.log("jsonData: ", jsonData)
        
        // detail data info
        detail = jsonData["data"][0];
        console.log("Detail", detail)

        // similar data info
        for (let i = 0; i < 5; i++) {
            window["similar_" + i] = jsonData["similar_data"][i][0];
          }
        console.log("similar_0", similar_0)
        console.log("similar_4", similar_4)
        
        // insert detail info
        data_info_name.innerHTML = `<li id='${nodeData}'>${detail['서비스명']} </li>`
        data_info_description.innerHTML = `<li id='${nodeData}'>${detail['서비스ID']} </li>`
        data_info_subdivision.innerHTML = `<li id='${nodeData}'>${detail['서비스설명']} </li>`
        data_info_type.innerHTML = `<li id='${nodeData}'>${detail['제공형식']} </li>`
        data_info_URL.innerHTML = `<li id='${nodeData}'>${detail['urls']} </li>`

        // insert similar data 
        similar_data_content.innerHTML = `
        <li id='${similar_0['서비스ID']}'>${similar_0['서비스명']}</li>
        <li id='${similar_1['서비스ID']}'>${similar_1['서비스명']}</li>
        <li id='${similar_2['서비스ID']}'>${similar_2['서비스명']}</li>
        <li id='${similar_3['서비스ID']}'>${similar_3['서비스명']}</li>
        <li id='${similar_4['서비스ID']}'>${similar_4['서비스명']}</li>
        `
      })
      .catch((error) => console.error(error));
  }


function get_adjacent_data(node){
    // 유사한 데이터 id 출력
    similar_data_content.innerHTML = ""
    for(let node_idx of node.adjacent_nodes){
        let adj_span = document.createElement("span")
        
        let textnode = document.createTextNode(node_idx)
        adj_span.appendChild(textnode)
        
        adj_span.classList.add("adj_data")
        adj_span.addEventListener("click", (e) => {
            search_node(node_idx)
        })
        similar_data_content.appendChild(adj_span)
        
        console.log("4. get_adjacent_data | 유사한 data id 출력:", textnode)
    }
}

function search_node(idx){
    // console.log("search_node")
    try{
        select_node(gData.nodes[idx])
    }
    catch{
        console.log(`failed to search ${idx}`)
    }

}

