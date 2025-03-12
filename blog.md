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

>    UDP协议
>    TCP协议

### 3. 网络地址

```
 IP地址     
 

 
```


- ## Java随笔


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



- ## 交换机命令行


- ## python自动化巡检


- ## 数模可视化绘图



