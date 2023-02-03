/**
 * 创建着色器
 * @param {*} gl
 * @param {*} type 类型（顶点着色器/片段着色器）
 * @param {*} source 文本
 */
function createShader(gl, type, source) {
  // 2. 创建着色器
  const shader = gl.createShader(type);
  // 3. 将着色文本关联到着色器
  gl.shaderSource(shader, source);
  // 4. 编译着色器
  gl.compileShader(shader);
  // 5. 判断编译状态
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  /**
   * 如果编译失败了要告知我们错误原因，并且立即修改，在这无法做任何容错
   * 因为着色程序需要成对的提供，如果一个着色器出问题那么这个程序就一定不能执行下去
   * 必须要修改到正确为止
   */
  //   if (!success) {
  //     // 打印失败的信息
  //     console.log(gl.getShaderInfoLog(shader));
  //     gl.deleteShader(shader); //删除错误的shader
  //   }
  if (success) {
    //若成功将shader返回
    return shader;
  }
  // 打印失败的信息
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader); //删除错误的shader
}
/**
 * 创建着色程序 program。
 * @param {*} gl WebGL 上下文；
 * @param {*} vertexShader 顶点着色器对象
 * @param {*} fragmentShader 片元着色器对象
 * @returns 
 */
function createProgram(gl, vertexShader, fragmentShader) {
  // 创建着色程序
  const program = gl.createProgram();
  // 让着色程序获取到顶点着色器
  gl.attachShader(program, vertexShader);
  // 让着色程序获取到片元着色器
  gl.attachShader(program, fragmentShader);
  // 将两个着色器与着色程序进行绑定
  gl.linkProgram(program);
  // 判断绑定状态
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {//如果成功返回当前着色程序
    return program;
  }
  //失败打印log信息
  console.log(gl.getProgramInfoLog(program));
  // 绑定失败则删除着色程序
  gl.deleteProgram(program);
}
function main() {
  const image = new Image();//创建一个img类
  image.src = 'logo.png'//写入路径
  image.onload = function () {//加载
    render(image)
  }
}
function render(image) {
  // 步骤一：获取 gl
  /**
   *      WebGL大多数元素都是可以通过状态来描述，状态是通过gl来调用切换，
   * gl指向的是绘图上下文，而绘图上下文是通过canvas这个载体来获取，所以要先创建canvas获取绘图上下文
   */
  //   1. 创建画布
  const canvas = document.createElement("canvas");
  document.getElementsByTagName("body")[0].appendChild(canvas);
  canvas.width = 400;
  canvas.height = 300;

  // 2. 获取 WebGL 上下文（Context），后续统称 gl。
  /**
   * 2d: 二位渲染
   * bitmaprenderer:将canvas内容转换为指定ImageBitmap
   * webgl,webgl2 :三维渲染（cocos采用的就是三维渲染）
   */
  const gl = canvas.getContext("webgl");

  //步骤二：顶点着色器
  /**
   * js脚本无法使用着色语言，但gl支持将文本转义成着色器
   */
  //   1.定义顶点着色器文本
  const vertexSource = `
  // 接收顶点位置数据 （需将它传递给gl内置变量gl_Position）
  attribute vec2 a_position;
  attribute vec2 a_uv;//定义顶点输入属性
  attribute vec4 a_color;//首先顶点属性要增加一个颜色输入

  varying vec4 v_color;//增加一个输出,为了给片元着色器
  varying vec2 v_uv;//定义顶点着色器输出

  // 着色器入口函数
  void main() {
      v_color = a_color;//赋值
      v_uv = a_uv;//赋值
      // gl_Position 接收的就是一个 vec4，因此需要转换 （vec2->vec4）
      gl_Position = vec4(a_position, 0.0, 1.0);//vec4的x,y来自于a_position,由于没有深度z为0，w分量为1
  }`;
  //  2. 根据着色器文本内容，创建 WebGL 上可以使用的着色器对象
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);//gl.VERTEX_SHADER顶点着色器类型
  // 3. 定义顶点数据  自定义裁剪坐标。还是以画三角形为例提供顶点数据。因为是一个平面三角形，因此每一个顶点只提供一个 vec2 即可。
  // const positions = [
  //   0, 0,
  //   0.7, 0,
  //   0, 0.5,
  //   0.7, 0.5,
  // ];
  // const vertexData = [
  //   0, 0, 1, 0, 0, 1,
  //   0.7, 0, 0, 1, 0, 1,
  //   0, 0.5, 0, 0, 1, 1,
  //   0.7, 0.5, 1, 0.5, 0, 1
  // ];
  // const positions = [
  //   0, 0,
  //   0.7, 0,
  //   0, 0.5,
  //   0.7, 0.5,
  // ];
  const vertexPosUv = [//每行前两个数据是矩形的下角对应的uv坐标的左下角，后两个是右下角，因为希望整张纹理都贴到矩形上，因此选的是可选范围的最大值
    0, 0, 0, 0,
    0.7, 0, 1, 0,
    0, 0.5, 0, 1,
    0.7, 0.5, 1, 1
  ]
  const colors = [
    255, 0, 0, 255,
    0, 255, 0, 255,
    0, 0, 255, 255,
    255, 127, 0, 255
  ];
  gl.enable(gl.CULL_FACE);//开启背面剔除
  // const arrayBuffer = new ArrayBuffer(positions.length * Float32Array.BYTES_PER_ELEMENT + colors.length);//设置字节长度
  // const positionBuffer = new Float32Array(arrayBuffer);
  // const colorBuffer = new Uint8Array(arrayBuffer);
  // // 当前顶点属性结构方式是 pos + color
  // // 按 float 32 分布 pos（2）+ color（1）
  // // 按子节分布 pos（2x4）+ color（4）
  // let offset = 0;
  // for (let i = 0; i < positions.length; i += 2) {
  //   // 位置时按每浮点数填充
  //   positionBuffer[offset] = positions[i];
  //   positionBuffer[offset + 1] = positions[i + 1];
  //   offset += 3;
  // }

  // offset = 8;
  // for (let j = 0; j < colors.length; j += 4) {
  //   // 颜色值时按每子节填充
  //   colorBuffer[offset] = colors[j];
  //   colorBuffer[offset + 1] = colors[j + 1];
  //   colorBuffer[offset + 2] = colors[j + 2];
  //   colorBuffer[offset + 3] = colors[j + 3];
  //   // 一个 stride，2 个 position 的 float，加 4 个 unit8，2x4 + 4 = 12
  //   offset += 12;
  // }
  // 4. 创建顶点缓冲对象
  /**
   * 在顶点着色器阶段会在GPU上创建内存存储我们的顶点数据,
   * 而顶点缓冲对象就是为了管理这个内存,他会在GPU内存中存储大量的顶点,
   * 使用缓冲对象的好处是可以一次性的发送一大批数据到显卡上,
   * 而不是每个顶点发送一次,从CPU把数据发送到GPU这个过程是比较慢的,
   * 所以只有有可能我们都尽量尝试一次性发送尽可能多的数据,这个数据发送到了GPU
   * 内存中之后,顶点着色器几乎能够立即访问到这些顶点,速度是非常快的,
   * 顶点缓冲对象的缓冲类型是gl.ARRAY_BUFFER,WEBGL允许我们同时绑定多个缓冲,
   * 只要它们是不同的缓冲类型,也就是说相同的类型后绑定的会替换之前绑定的,
   * 然后我们再往ARRAY_BUFFER上传递顶点数据,数据就会存储到绑定的顶点缓冲上
   */
  const vertexBuffer = gl.createBuffer();
  // 5.将顶点缓冲对象绑定到 gl 的 ARRAY_BUFFER 字段上。
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPosUv), gl.STATIC_DRAW)//传入数据
  // gl.bufferData(gl.ARRAY_BUFFER, arrayBuffer, gl.STATIC_DRAW)//传入数据

  const colorBuffer = gl.createBuffer();
  // 5.将顶点缓冲对象绑定到 gl 的 ARRAY_BUFFER 字段上。
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(colors), gl.STATIC_DRAW)//传入数据

  // 定义顶点索引
  const indices = [
    0, 1, 2,
    2, 1, 3
  ]
  const indexBuffer = gl.createBuffer()//创建索引缓冲对象
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)//绑定索引缓冲对象
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW)//传入数据
  // 6.往ARRAY_BUFFER上传递顶点数据,数据就会存储到绑定的顶点缓冲上
  /**
   *     第一个参数: bufferData 主要是初始化buffer对象的数据存储,因此时要给顶点缓冲传递数据
   * 因此选择的是ARRAY_BUFFER缓冲()
   *     第二个参数:设定buffer数据存储区的大小,GPU上的内存容量通常不会很大,
   * 因此需要合理的分配内存,这里就是为顶点位置数据分配字节数,因为每一个顶点分量都是浮点型,
   * 因此这里申请采用float32位的浮点型数组存储数据,一般对浮点型数据也都采用32位字节存储
   *     最后一个参数 gl.STATIC_DRAW 是提示 WebGL 我们将怎么使用这些数据。因为此处我们将顶点数据写死了，所以采用 gl.STATIC_DRAW。
   * gl.STATIC_DRAW ：数据不会或几乎不会改变。(直接写死)
   * gl.DYNAMIC_DRAW：数据会被改变很多。(动态更新)
   * gl.STREAM_DRAW ：数据每次绘制时都会改变
   */
  // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW)

  //    步骤三：定义片元着色器
  // 1.同顶点着色器操作类似
  // 2.获取片元着色器文本
  const fragmentShaderSource = `
    //声明所有浮点型精度，这里采用中精度
    precision mediump float;

    // 定义一个颜色Uniform，用来接收我们传入的颜色值
    // uniform vec4 u_color;
    uniform sampler2D mainTexture;//定义2D图像unifrom

    varying vec2 v_uv;
    varying vec4 v_color;//增加一个输出,为了给片元着色器
    
    // 着色器入口函数
    void main() {//让片元着色器为所有的片元输出统一的颜色
        // 将三角形输出的最终颜色固定为玫红色
        // 这里的四个分量分别代表红（r）、绿（g）、蓝（b）和透明度（alpha）
        // 颜色数值取归一化值。最终绘制的其实就是 [255, 0, 127.5, 255]
        // gl_FragColor = u_color;//gl_FragColor为gl内置变量
        // gl_FragColor = v_color;//gl_FragColor为gl内置变量
        gl_FragColor = texture2D(mainTexture,v_uv) * v_color;// 使图像结合uv,并叠加上颜色
    }`;
  // 3. 创建片元着色器
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);//片元着色器类型gl.FRAGMENT_SHADER
  // 步骤四：将片元着色器与定点着色器绑定到着色程序 

  // 将顶点着色器和片元着色器绑定到着色程序上。
  // 这个上一章提过，着色程序需要成对提供，其中一个是顶点着色器，另一个是片元着色器
  const program = createProgram(gl, vertexShader, fragmentShader);
  /**
   *      到这一步为止 已经把输入的顶点数据发送给了GPU,并指示GPU如何在顶点着色器中处理它
   * 但还没结束,WEBGL还不知道如何解析内存中的顶点数据,也就是如何将顶点数据连接到顶点着色器属性上
   *      顶点着色器有个特性,就是允许指定任何以顶点属性为形式输入,即一个顶点可以包含多个属性(如位置属性),
   * 这种形式的输入为我们在数据组织上提供了很大的灵活性,因为这边只有一个顶点属性,
   * 所以一个float32位的顶点缓冲会被解析成(如图https://mmbiz.qpic.cn/mmbiz_png/jlMCD4Fz8djZvTI0HIBFbYn2KPmXEGHAJouI6VW4J6JxXYwJSw81ff9KUOA6S7QwZPjtL21ZateE5fAzeiaseXg/640?wx_fmt=png)
   *      可以看出 
   *      1. 每个顶点位置包含两个位置分量,由于缓冲采用的是float32位浮点型数组,一个字节是8位,
   * 因此一个分量占4个字节,一个顶点属性占8个字节
   *      2. offset 代表当前输入数据在一个顶点数据里的偏移。由于这个顶点数据里只有 position，因此偏移量为 0。
   * 如果后续还有顶点颜色，纹理坐标等，那么就需要根据数据结构，选取合适的偏移量，偏移量采用“数据偏移长度 x 字节数的形式提供”。
   *      3. stride 代表一个顶点数据总的字节长度，计算方式为 顶点数据长度 * sizeof(float)。
   * 比如：一个顶点数据只有一个顶点属性position,一个 position 有 2 个分量，采用的是 float 32 位浮点型数据，那么它(一个顶点数据)所占用的字节数为  2x4 = 8。
   */
  // 了解这些之后开始解析顶点数据

  // 步骤五：处理绘制的前置工作
  //  1. 设置视口尺寸，将视口和画布尺寸同步(方便在屏幕映射时将NDC坐标转换到屏幕坐标)
  // 屏幕映射得到的屏幕坐标决定了这个顶点对应屏幕上哪个像素,最终这些值都会交给光栅器处理,
  // 同时还要清除画布颜色和颜色缓冲
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  // 2. 清除画布颜色，直接设置成透明色。此处是为了便于观察，将它设置成黑色。
  // 注意，渲染管线是每帧都会绘制内容，就好比每帧都在画板上画画，如果不清除的话，就有可能出现花屏现象
  gl.clearColor(0, 0, 0, 255);
  gl.clear(gl.COLOR_BUFFER_BIT);
  // 步骤六：启动着色程序，启用顶点属性
  // 1. 每次绘制之前都要启用指定的着色程序
  gl.useProgram(program);
  // 2. 获取顶点位置属性在顶点着色器中的位置索引(索引号引用到GPU维护的属性列表中)
  const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  // 3. 每次对属性进行操作都要激活属性
  gl.enableVertexAttribArray(positionAttributeLocation);
  // 4. 将顶点缓冲绑定到当前数据缓冲接口(ARRAY_BUFFER)上，以确保当前ARRAY_BUFFER使用的缓冲是我要的顶点缓冲
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 16, 0);

  const uvAttributeLocation = gl.getAttribLocation(program, 'a_uv');//获取顶点位置属性在顶点着色器中的位置索引
  gl.enableVertexAttribArray(uvAttributeLocation);//激活属性
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 16, 8);

  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');//获取顶点位置属性在顶点着色器中的位置索引
  gl.enableVertexAttribArray(colorAttributeLocation);//激活属性
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);



  // 步骤七：告诉属性如何获取数据

  /**
   * 第一个参数（index）：代表获取顶点着色器上指定属性的位置 （我们这里已经获取到a_position的位置）
   * 第二个参数（size）：代表当前一个顶点数据要取的数据长度（我们这里每一个顶点提交的都是二维坐标因此数量为2）
   * 第三个参数（type）：数据缓冲类型（这里采用的是float32位浮点型，因此这里使用的是gl的float告诉WebGL当前的数据是浮点型）
   * 第四个参数（normalized）：决定数据是否要归一化（这里已经提供就是裁剪坐标，所以不归一化，归一化使用会在下节）
   * 第五个参数（stride）：代表数据存储方式（单位是字节，0表示数据是连续存放的，通常在只有一个属性数据里这么用），
   * 比如 当前提交的顶点数据只有顶点位置，非0 则表示同一个属性在数据中的间隔大小，可以理解为步长（下节也会说）
   * 第六个参数（offset）：表示属性在缓冲区中每间隔的偏移值，单位是字节（因为我们是连续的数据，所以这里偏移值还是0）
   * 
   */
  gl.vertexAttribPointer(colorAttributeLocation, 4, gl.UNSIGNED_BYTE, true, 0, 0);

  const texture = gl.createTexture()//创建图像缓存
  gl.bindTexture(gl.TEXTURE_2D,texture)//绑定当前图像
  // 设置环绕方式,如果跟默认值一样没有修改的话，这里也可以不设置
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // 设置纹理过滤方式
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);//翻转y轴
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);//上传纹理图像
  // const vertexColorLocation = gl.getUniformLocation(program, 'u_color');//获取uniform它的索引值
  // // gl.uniform4f(vertexColorLocation, 0, 0, 1, 1);//给uniform赋值 设置为纯蓝色
  // gl.uniform4fv(vertexColorLocation, [0, 0, 1, 1]);//给uniform赋值 设置为纯蓝色 数组形式

  // 步骤八：绘制
  //  调用绘图接口 gl.drawArrays
  /**
   * 第一个参数（mode）：模式 ，代表我们可以绘制的到底是点(gl.POINTS)还是线(gl.LINES)还是面(gl.TRIANGLES)（我们要绘制三角形，所以属于面）
   * 第二个参数（first）：从哪个点开始，（我们这里默认选0）
   * 第三个参数（count）：绘制几个顶点，（这里是三角形，所以需要3个顶点）
   */
  // gl.drawArrays(gl.TRIANGLES, 0, 6)

  // gl.drawElements(primitiveType, count, indexType, offset);  1-类型（）
  // 部分参数与 gl.drawArrays 一致。indexType：指定元素数组缓冲区中的值的类型。有 gl.UNSIGNED_BYTE、gl.UNSIGNED_SHORT 以及扩展类型
  // gl.UNSIGNED_BYTE 最大索引值为 255，gl.UNSIGNED_SHORT 最大索引值为 65535
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_BYTE, 0);
}
main()