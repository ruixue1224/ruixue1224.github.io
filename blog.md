*   正文



# 个人博客笔记·瑞雪


- ## 网络基础笔记

### 1.  网络基础模型

>    OSI网络参考模型（七层）

|层次|英文名称|主要功能|数据单元|常见协议|互联设备|
| ---- | ---- | ---- | ---- | ---- | ---- |
|应用层|Application Layer|为用户的应用程序提供网络服务，如文件传输、电子邮件、网页浏览等|应用数据|HTTP、FTP、SMTP、POP3、DNS、Telnet等|计算机  |
|表示层|Presentation Layer|对数据进行格式转换（如ASCII与Unicode转换）、加密解密、压缩解压缩，确保不同系统间数据的兼容性|表示数据|JPEG、ASCII、GIF、DES、MPEG等|  |
|会话层|Session Layer|建立、管理和终止应用进程之间的会话，包括会话的同步、恢复等功能|会话数据|RPC、SQL、NFS等|  |
|传输层|Transport Layer|提供端到端的可靠（TCP）或不可靠（UDP）的数据传输服务，处理流量控制和差错控制，通过端口号区分不同应用程序|数据段（Segment）|TCP、UDP、RTP、SCTP、SPX等|  |
|网络层|Network Layer|进行逻辑地址（如IP地址）寻址，选择数据从源到目的的传输路径，实现不同网络之间的路径选择|数据包（Packet）|IP、ICMP、IGMP、IPX、ARP、RARP、BGP、RIP等|路由器、防火墙、三层交换机|
|数据链路层|Data Link Layer|将比特组合成帧，进行物理地址（MAC地址）寻址，提供差错检测和纠正机制，实现相邻节点间的数据可靠传输|帧（Frame）|IEEE 802.3/.2、HDLC、PPP、ATM等|网桥、二层交换机|
|物理层|Physical Layer|在物理介质（如电缆、光纤）上传输原始的比特流，定义了电气、机械、时序和物理接口标准|比特（Bit）|RS-232、V.35、RJ-45、FDDI等|集线器、中继器、网线、调制解调器、网卡| 
>    TCP/IP网络参考模型(五层)

|层次|英文名称|主要功能|数据单元|常见协议|互联设备|
| ---- | ---- | ---- | ---- | ---- | ---- |
|应用层|Application Layer|为用户应用程序提供网络服务，涵盖文件传输、网页浏览、邮件收发等|数据|HTTP、HTTPS、FTP、SMTP、POP3、DNS、Telnet等|计算机|
|传输层|Transport Layer|负责端到端的数据传输，提供可靠的面向连接（TCP）和不可靠的无连接（UDP）服务，利用端口号区分不同应用进程|数据段（Segment）|TCP、UDP、SCTP等|  |
|网络层|Network Layer|实现逻辑地址（IP地址）寻址，进行路由选择，确保数据包从源端到目的端的正确转发|数据包（Packet）|IP、ICMP、IGMP、ARP、RARP、OSPF、BGP等|路由器、三层交换机、防火墙|
|数据链路层|Data Link Layer|将网络层的数据包封装成帧，借助物理地址（MAC地址）实现相邻节点间的数据传输，提供差错检测功能|帧（Frame）|Ethernet、PPP、HDLC、802.11（无线局域网）等|网桥、二层交换机|
|物理层|Physical Layer|在物理介质上传输原始比特流，规定了接口和传输介质的电气、机械特性及时序关系|比特（Bit）|RJ-45、光纤接口标准、同轴电缆标准等|集线器、中继器、网卡| 
### 2.  网络协议



 **TCP 与 UDP 协议**的详细讲解，包括协议特点、基于它们的应用层协议、应用场景及对比总结：

---

### **一、TCP（Transmission Control Protocol）**
#### **1. 核心特点**
- **面向连接**：通过 **三次握手** 建立连接，**四次挥手** 断开连接。
- **可靠传输**：
  - 数据包确认（ACK）与重传机制。
  - 序列号（Sequence Number）保证数据顺序。
  - 流量控制（滑动窗口协议）和拥塞控制（如慢启动、拥塞避免）。
- **全双工通信**：双方可同时发送和接收数据。
- **字节流传输**：数据被视为无结构的字节流，无固定边界。

#### **2. 应用层协议（基于TCP）**
- **HTTP/HTTPS**：网页传输（端口80/443）。
- **FTP**：文件传输（端口20/21）。
- **SMTP**：邮件发送（端口25）。
- **POP3/IMAP**：邮件接收（端口110/143）。
- **Telnet**：远程登录（端口23）。
- **SSH**：安全远程登录（端口22）。
- **数据库协议**：如 MySQL（3306）、Redis（6379）。

#### **3. 典型应用场景**
- **要求高可靠性的场景**：
  - 文件传输（FTP）、网页加载（HTTP）。
  - 电子邮件发送（SMTP）、数据库操作。
- **长连接交互**：如 SSH 远程控制。

#### **4. TCP 头部格式**
- 包含 **源端口、目的端口、序列号、确认号、窗口大小、校验和** 等字段。
- 头部固定 **20字节**（无选项时）。

---

### **二、UDP（User Datagram Protocol）**
#### **1. 核心特点**
- **无连接**：无需建立连接，直接发送数据。
- **不可靠传输**：
  - 无确认机制，数据可能丢失、重复或乱序。
- **面向报文**：保留应用层报文边界。
- **高效性**：头部开销小（仅8字节），传输延迟低。
- **支持广播/多播**：可同时向多个主机发送数据。

#### **2. 应用层协议（基于UDP）**
- **DNS**：域名解析（端口53，默认UDP，长度过大时切换TCP）。
- **DHCP**：动态主机配置（端口67/68）。
- **SNMP**：网络管理（端口161/162）。
- **TFTP**：简单文件传输（端口69）。
- **NTP**：网络时间同步（端口123）。
- **实时音视频协议**：如 RTP（实时传输协议）、QUIC（HTTP/3底层协议）。

#### **3. 典型应用场景**
- **实时性要求高的场景**：
  - 视频会议（Zoom、腾讯会议）、在线直播（RTMP）。
  - 在线游戏（如 FPS 类游戏）。
- **简单查询/响应**：
  - DNS 查询、SNMP 监控。
- **广播/多播应用**：如 IPTV 组播。

#### **4. UDP 头部格式**
- 仅包含 **源端口、目的端口、长度、校验和** 四个字段。
- 固定 **8字节**，结构简单。

---

### **三、TCP vs UDP 对比总结**
| **特性**         | **TCP**                              | **UDP**                              |
|------------------|--------------------------------------|--------------------------------------|
| **连接方式**     | 面向连接（三次握手）                  | 无连接                               |
| **可靠性**       | 可靠（确认、重传、顺序控制）          | 不可靠（可能丢包、乱序）              |
| **传输效率**     | 低（需建立连接、复杂控制）            | 高（无连接、头部开销小）              |
| **数据边界**     | 字节流（无边界）                      | 报文（保留边界）                      |
| **拥塞控制**     | 有（慢启动、拥塞避免）                | 无                                   |
| **应用场景**     | 文件传输、网页浏览、邮件              | 实时音视频、DNS、广播/多播            |
| **头部大小**     | 20~60字节（含选项）                   | 8字节                                |

---

### **四、常见考点（软考重点）**
1. **TCP 三次握手与四次挥手**：
   - **三次握手**：SYN → SYN-ACK → ACK。
   - **四次挥手**：FIN → ACK → FIN → ACK（TIME_WAIT状态的作用）。
   
2. **TCP 流量控制与拥塞控制**：
   - **滑动窗口**：动态调整发送速率。
   - **慢启动**：指数增长窗口，直到阈值后线性增长。

3. **UDP 如何实现可靠性**（如 QUIC）：
   - 在应用层实现重传、确认机制（如 HTTP/3 的 QUIC 协议）。

4. **端口号记忆**：
   - TCP：HTTP（80）、HTTPS（443）、FTP（21）、SSH（22）。
   - UDP：DNS（53）、DHCP（67/68）、SNMP（161）。

5. **协议选择依据**：
   - 需要可靠传输 → TCP。
   - 实时性优先 → UDP。

---







### 3. 网络地址

```
 IP地址     
 

 
```


- ## Java随笔

> #### 数组的用户键盘接收

```java
import java.util.Scanner;

public class StringArrayInput {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("请输入数组的长度: ");
        int length = scanner.nextInt();
        scanner.nextLine(); // 消耗掉 nextInt() 后的换行符

        String[] array = new String[length];
        System.out.println("请输入 " + length + " 个字符串:");
        for (int i = 0; i < length; i++) {
            array[i] = scanner.nextLine();
        }

        System.out.println("你输入的数组是:");
        for (String str : array) {
            System.out.println(str);
        }
        scanner.close();
    }
}

```

---



> #### 数据处理函数（Math函数）

以下是Java中`Math`类的主要函数用法及示例：

### 1. 绝对值
- `Math.abs(a)`：返回绝对值。
```java
int a = Math.abs(-10); // 10
double b = Math.abs(-3.14); // 3.14
```

### 2. 三角函数
- `Math.sin(a)` / `Math.cos(a)` / `Math.tan(a)`：参数为弧度。
```java
double sinValue = Math.sin(Math.PI / 2); // 1.0
double cosValue = Math.cos(Math.PI); // -1.0
```

### 3. 反三角函数
- `Math.asin(a)` / `Math.acos(a)` / `Math.atan(a)`：返回弧度值。
- `Math.atan2(y, x)`：计算极角。
```java
double angle = Math.atan(1); // π/4 ≈ 0.785
double angle2 = Math.atan2(1, 1); // π/4
```

### 4. 角度与弧度转换
- `Math.toDegrees(a)` / `Math.toRadians(a)`。
```java
double degrees = Math.toDegrees(Math.PI); // 180.0
```

### 5. 指数与对数
- `Math.exp(a)`：计算e的幂。
- `Math.log(a)`：自然对数。
- `Math.log10(a)`：以10为底的对数。
- `Math.pow(a, b)`：a的b次方。
```java
double e = Math.exp(1); // ≈2.718
double log = Math.log(Math.E); // 1.0
double log10 = Math.log10(100); // 2.0
double pow = Math.pow(2, 3); // 8.0
```

### 6. 平方根与立方根
- `Math.sqrt(a)` / `Math.cbrt(a)`。
```java
double sqrt = Math.sqrt(16); // 4.0
double cbrt = Math.cbrt(27); // 3.0
```

### 7. 取整方法
- `Math.round(a)`：四舍五入。
- `Math.ceil(a)`：向上取整。
- `Math.floor(a)`：向下取整。
- `Math.rint(a)`：返回最接近的整数（双精度）。
```java
long rounded = Math.round(3.5); // 4
double ceil = Math.ceil(3.1); // 4.0
double floor = Math.floor(3.9); // 3.0
double rint = Math.rint(2.5); // 2.0
```

### 8. 最大值与最小值
- `Math.max(a, b)` / `Math.min(a, b)`。
```java
int max = Math.max(5, 10); // 10
double min = Math.min(3.14, 2.71); // 2.71
```

### 9. 随机数
- `Math.random()`：生成[0.0, 1.0)的随机数。
```java
double rand = Math.random();
int dice = (int)(rand * 6) + 1; // 1~6的整数
```

### 10. 符号函数
- `Math.signum(a)`：返回符号（1.0、-1.0或0）。
```java
double sign = Math.signum(-5.5); // -1.0
```

### 11. 双曲函数
- `Math.sinh(a)` / `Math.cosh(a)` / `Math.tanh(a)`。
```java
double coshVal = Math.cosh(0); // 1.0
```

### 12. 斜边计算
- `Math.hypot(x, y)`：计算√(x² + y²)。
```java
double hypot = Math.hypot(3, 4); // 5.0
```

### 13. 数学常量
- `Math.PI`：π ≈3.141592653589793。
- `Math.E`：自然对数的底e ≈2.718281828459045。

### 14. 精确运算（Java 8+）
- `addExact` / `subtractExact` / `multiplyExact`：溢出时抛出异常。
```java
int sum = Math.addExact(100, 200); // 300
// Math.addExact(Integer.MAX_VALUE, 1); // 抛出ArithmeticException
```

### 15. 邻近浮点数
- `Math.nextUp(a)` / `Math.nextDown(a)`：返回相邻的浮点数。
```java
double next = Math.nextUp(1.0); // 1.0000000000000002
```

### 16. 其他方法
- **`Math.copySign(magnitude, sign)`**：返回具有指定符号的数值。
  ```java
  double copied = Math.copySign(5.0, -1.0); // -5.0
  ```
  
- **`Math.getExponent(a)`**：返回浮点数的无偏指数。
  ```java
  int exponent = Math.getExponent(8.0); // 3（因为8=2³）
  ```
  
- **`Math.scalb(a, scale)`**：a × 2^scale。
  ```java
  double scaled = Math.scalb(3.0, 2); // 12.0
  ```
  
- **`Math.IEEEremainder(a, b)`**：计算IEEE标准的余数。
  ```java
  double rem = Math.IEEEremainder(10, 3); // 1.0
  ```

### 完整示例代码
```java
public class MathExamples {
    public static void main(String[] args) {
        // 绝对值
        System.out.println("Math.abs(-10): " + Math.abs(-10));
        // 三角函数
        System.out.println("Math.sin(π/2): " + Math.sin(Math.PI/2));
        // 反三角函数
        System.out.println("Math.atan(1): " + Math.atan(1));
        // 指数和对数
        System.out.println("Math.pow(2, 3): " + Math.pow(2, 3));
        // 四舍五入
        System.out.println("Math.round(3.5): " + Math.round(3.5));
        // 随机数
        System.out.println("随机数[1-6]: " + ((int)(Math.random() * 6) + 1));
        // 斜边计算
        System.out.println("Math.hypot(3,4): " + Math.hypot(3, 4));
    }
}
```

输出示例：
```
Math.abs(-10): 10
Math.sin(π/2): 1.0
Math.atan(1): 0.7853981633974483
Math.pow(2, 3): 8.0
Math.round(3.5): 4
随机数[1-6]: 4
Math.hypot(3,4): 5.0
```

这些方法覆盖了`Math`类的大部分常用功能，更多细节可参考[Java官方文档](https://docs.oracle.com/javase/8/docs/api/java/lang/Math.html)。

---

> ####  保留小数位

在 Java 中保留指定小数位数可以通过多种方法实现，具体取决于需求（如四舍五入、截断、格式化输出等）。以下是几种常见方法及示例：



### **方法 1：`DecimalFormat` 格式化（推荐）**
使用 `DecimalFormat` 类可以灵活控制小数位数和格式，支持四舍五入。

```java
import java.text.DecimalFormat;

public class Main {
    public static void main(String[] args) {
        double number = 3.1415926;
        int n = 3; // 保留3位小数
        
        // 定义格式（例如 "0.000" 表示保留3位小数）
        DecimalFormat df = new DecimalFormat("0." + "0".repeat(n));
        String formatted = df.format(number);
        
        System.out.println(formatted); // 输出 3.142
    }
}
```

#### 特点：
- **四舍五入**：默认使用 `RoundingMode.HALF_EVEN`（银行家舍入法）。
- **线程不安全**：需避免多线程共享同一个 `DecimalFormat` 实例。
- **灵活格式**：支持千分位、科学计数法等（如 `"#,###.000"`）。

---

### **方法 2：`String.format` 格式化**
使用 `String.format` 快速格式化字符串，默认四舍五入。

```java
public class Main {
    public static void main(String[] args) {
        double number = 3.1415926;
        int n = 3; // 保留3位小数
        
        String formatted = String.format("%." + n + "f", number);
        System.out.println(formatted); // 输出 3.142
    }
}
```

#### 特点：
- **简洁易用**：适合快速格式化输出。
- **四舍五入**：与 `DecimalFormat` 的默认行为一致。
- **返回字符串**：结果不可直接用于数值计算。

---

### **方法 3：`BigDecimal` 精确计算**
使用 `BigDecimal` 进行高精度计算，可指定舍入模式（如四舍五入、截断）。

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        double number = 3.1415926;
        int n = 3; // 保留3位小数
        
        BigDecimal bd = new BigDecimal(Double.toString(number));
        bd = bd.setScale(n, RoundingMode.HALF_UP);
        
        System.out.println(bd.doubleValue()); // 输出 3.142
    }
}
```

#### 特点：
- **高精度**：避免浮点数精度丢失（适合金融计算）。
- **明确舍入模式**：如 `RoundingMode.HALF_UP`（四舍五入）、`RoundingMode.DOWN`（直接截断）。
- **性能开销**：比直接操作 `double` 稍慢。

---

### **方法 4：`Math.round` 结合乘除法**
通过乘除法和 `Math.round` 手动控制小数位数。

```java
public class Main {
    public static void main(String[] args) {
        double number = 3.1415926;
        int n = 3; // 保留3位小数
        
        double factor = Math.pow(10, n);
        double rounded = Math.round(number * factor) / factor;
        
        System.out.println(rounded); // 输出 3.142
    }
}
```

#### 特点：
- **简单直接**：适合简单场景。
- **精度风险**：浮点数乘除法可能导致精度丢失（如 `0.1` 无法精确表示）。
- **仅四舍五入**：无法自定义舍入模式。

---

### **方法 5：`NumberFormat` 本地化格式化**
结合 `NumberFormat` 处理本地化格式（如小数点符号为逗号的欧洲格式）。

```java
import java.text.NumberFormat;
import java.util.Locale;

public class Main {
    public static void main(String[] args) {
        double number = 3.1415926;
        int n = 3; // 保留3位小数
        
        NumberFormat nf = NumberFormat.getNumberInstance(Locale.FRANCE); // 法国格式
        nf.setMaximumFractionDigits(n);
        nf.setMinimumFractionDigits(n);
        
        System.out.println(nf.format(number)); // 输出 3,142（逗号分隔）
    }
}
```

#### 特点：
- **本地化支持**：适配不同地区的数字格式。
- **四舍五入**：默认使用当前地区的舍入规则。

---

### **总结**
| 方法               | 适用场景                           | 优点                          | 缺点                     |
|--------------------|----------------------------------|-----------------------------|------------------------|
| **`DecimalFormat`** | 格式化输出、灵活控制格式            | 灵活，支持自定义格式            | 线程不安全               |
| **`String.format`** | 快速格式化字符串                   | 代码简洁                     | 结果不可直接用于计算       |
| **`BigDecimal`**    | 高精度计算（如金融场景）           | 精确，支持自定义舍入模式        | 代码冗长，性能略低        |
| **`Math.round`**    | 简单四舍五入                     | 代码简短                     | 浮点数精度风险           |
| **`NumberFormat`**  | 本地化格式输出                   | 适配不同地区格式               | 依赖本地化设置           |

根据具体需求选择合适的方法！如果只是格式化输出，推荐 `String.format` 或 `DecimalFormat`；若涉及精确计算，优先使用 `BigDecimal`。

- ## 交换机命令行


- ## python自动化巡检


- ## 数模可视化绘图



