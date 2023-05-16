const N = 300;

const gData = {
    nodes: [...Array(N).keys()].map((i) => ({ id: i, adjacent_nodes: [] })),
    links: [...Array(N).keys()]
        .filter((id) => id)
        .map((id) => ({
            source: Math.round(Math.random() * (id - 1)),
            target: id,
        })),
};

gData.links.forEach((link) => {
    gData.nodes[link.source].adjacent_nodes.push(link.target);
    gData.nodes[link.target].adjacent_nodes.push(link.source);
});

const graph_elem = document.querySelector(".graph");
const Graph = ForceGraph3D()(graph_elem);

var data_info_name = document.querySelector(
    ".data_info .content_list > li:nth-child(1) > .val"
);
var similar_data_content = document.querySelector(
    ".similar_data .similar_list"
);

function update_data_info(node) {
    data_info_name.innerText = node.index;
}
// 나중에 처리
// function get_adjacent_data(node) {
//     console.log('새로ㅓ운 부분',node)
//     similar_data_content.innerHTML = "";
//     for (let node_idx of node.adjacent_nodes) {
//         let adj_span = document.createElement("li");

//         let textnode = document.createTextNode(node_idx);
//         adj_span.appendChild(textnode);

//         adj_span.classList.add("adj_data");
//         adj_span.addEventListener("click", (e) => {
//             search_node(node_idx);
//         });
//         similar_data_content.appendChild(adj_span);
//     }
// }

function select_node(node) {
    console.log(node);
    update_data_info(node);
    //get_adjacent_data(node);

    const distance = 400;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    const newPos =
        node.x || node.y || node.z
            ? {
                  x: node.x * distRatio,
                  y: node.y * distRatio,
                  z: node.z * distRatio,
              }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        1500 // ms transition duration
    );
}

function search_node(idx) {
    try {
        select_node(gData.nodes[idx]);
    } catch {
        console.log(`failed to search ${idx}`);
    }
}

// 드래그 앤 드랍 코드
function dragElement(elmnt, target_elemnt) {
    let pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        target_elemnt.style.top = target_elemnt.offsetTop - 10 - pos2 + "px";
        target_elemnt.style.left = target_elemnt.offsetLeft - 10 - pos1 + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}


//건영 수정 /////////////////////////////////////////////////////////
function load(){
    return  fetch('./datasets/total_1.json')
    .then((response) => response.json())
  }

function once(){
if (is_action === true) { is_action = false;
    return false } 
else{
    is_action = true; 
    return true
}};
//link 생성
function similar_link(node_source,node_target){
    var person1 = new Object();
    person1.source = node_source.id
    person1.target = node_target.id
    return person1
}
//randomnum
function getRandomNum(){
    min = -40
    max = +40
    return parseFloat((Math.random()*(max - min) + min).toFixed(3));
}
function intoTheNode(node,Graph){
    const distance = 120;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    const newPos = node.x || node.y || node.z
      ? { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }
      : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)
    Graph.cameraPosition(
        newPos, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
}
is_action = false
//유사 데이터 불러오기
function similardata(nh){
    console.log('similar입니다',1)
    let x = nh.fx
    let y = nh.fy
    let z = nh.fz
    data_links = []
    //유사도 패치 불러오기 return이 data 모양
    //data가 겹쳐서,, 그런다... 패치로 불러와야한다..
    if (is_action==false) {
        data_node = [{"id": "일반행정", "group": 5, "collapsed": true, "category": false},
        {"id": "보건", "group": 0, "collapsed": true, "category": false}, 
        {"id": "문화/관광", "group": 1, "collapsed": true, "category": false},
         {"id": "산업/경제", "group": 2, "collapsed": true, "category": false}]
        is_action = once()
    } else{
        data_node = [{"id": "안녕", "group": 5, "collapsed": true, "category": false},
        {"id": "호호", "group": 0, "collapsed": true, "category": false}, 
        {"id": "하/관광", "group": 1, "collapsed": true, "category": false},
         {"id": "경제", "group": 2, "collapsed": true, "category": false}]
        is_action = once()
    }

    data_node.forEach(i => {
        i["fx"] = x + getRandomNum()
        i["fy"] = y + getRandomNum()
        i["fz"] = z + getRandomNum()
    })
    data_node.forEach(i => { data_links.push(similar_link(nh,i)) })
    return {nodes: data_node, links: data_links}
}

////////////////////////////////////////////////////////////////////////////////////////////////

(async function () {
    jsonData = await load(); // load도 상수화,, json이 달라지니까
    //const nodesById = Object.fromEntries(jsonData.nodes.map(node => [node.name, node]))
        const getNodesTree = (nh) => {
        const visibleNodes = []
        const visibleLinks = []
        jsonData.nodes.forEach(i => visibleNodes.push(i))

        let arr = visibleNodes.filter(i => {
            return i.collapsed == false
        })
        console.log('arr',arr)

        if (!nh){
            return { nodes: visibleNodes, links: visibleLinks};
        }

        if (!nh.collapsed) {
            console.log('collapsed')
            similar = similardata(nh)
            similar.nodes.forEach(i => visibleNodes.push(i))
            similar.links.forEach(i => visibleLinks.push(i))
        }

        if (arr){
            arr.forEach(i => {
                if (i != nh){
                similar = similardata(i)
                similar.nodes.forEach(i => visibleNodes.push(i))
                similar.links.forEach(i => visibleLinks.push(i))
            }})
        }

        console.log('visi',visibleNodes)
        return { nodes: visibleNodes, links: visibleLinks};
    }
    Graph.graphData(getNodesTree());
    Graph.onNodeClick((node) => {
        select_node(node);
        bool = Object.keys(node).includes("category")
        if (bool){
            return ;
          }else{
            node.collapsed = !node.collapsed; // toggle collapse state
          }
        Graph.graphData(getNodesTree(node))

        intoTheNode(node,Graph)

    });
    Graph.linkWidth(2)
    let search = document.querySelector(".search_button");
    search.addEventListener("click", (e) => {
        let search_target = document.querySelector(".search").value;
        search_node(parseInt(search_target));
    });

    let side_windows = document.querySelectorAll(".side_window");
    for (let side_window of side_windows) {
        dragElement(side_window.querySelector(".title"), side_window);
        dragElement(side_window.querySelector("button"), side_window);
    }

    let side_window_buttons = document.querySelectorAll(
        ".side_window > button"
    );

    for (let but of side_window_buttons) {
        but.addEventListener("click", (e) => {
            but.parentNode.classList.toggle("open");
        });
    }
    })();

window.onload = function () {

};
