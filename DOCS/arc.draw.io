<mxfile host="app.diagrams.net">
  <diagram name="Layered Architecture">
    <mxGraphModel dx="1200" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1100" pageHeight="850">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>

        <!-- Title -->
        <mxCell id="title" value="LAYERED ARCHITECTURE SUMMARY" style="text;html=1;fontSize=22;fontStyle=1;" vertex="1" parent="1">
          <mxGeometry x="350" y="20" width="400" height="40" as="geometry"/>
        </mxCell>

        <!-- Layer 1 -->
        <mxCell id="layer1" value="LAYER 1: PRESENTATION (Client)&#xa;• React Components (StudentExams, TakeExam, StudentResults)&#xa;• LocalStorage (JWT token, user data)&#xa;• Fetch/Axios (API calls)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#d6eaff;strokeColor=#2a78d1;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="200" y="100" width="700" height="90" as="geometry"/>
        </mxCell>

        <!-- Layer 2 -->
        <mxCell id="layer2" value="LAYER 2: NETWORK SECURITY (TLS/SSL)&#xa;• HTTPS encryption (Port 443)&#xa;• Certificate validation&#xa;• Secure communication tunnel" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e0f7e9;strokeColor=#2e9b57;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="200" y="220" width="700" height="90" as="geometry"/>
        </mxCell>

        <!-- Layer 3 -->
        <mxCell id="layer3" value="LAYER 3: REVERSE PROXY (LiteSpeed/Nginx)&#xa;• TLS termination&#xa;• Request routing&#xa;• Load balancing&#xa;• Compression (gzip)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#fff2cc;strokeColor=#d6a300;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="200" y="340" width="700" height="90" as="geometry"/>
        </mxCell>

        <!-- Layer 4 -->
        <mxCell id="layer4" value="LAYER 4: API SERVER (Express.js)&#xa;• Trust Proxy&#xa;• CORS Middleware&#xa;• Body Parser&#xa;• JWT Auth&#xa;&#xa;Business Logic&#xa;• Route Matching (exams.js)&#xa;• Role-based Authorization&#xa;• Data Validation&#xa;• Query Building&#xa;&#xa;Database Layer&#xa;• Connection Pool&#xa;• Query Executor&#xa;• Transaction Manager&#xa;&#xa;Response Building&#xa;• Data formatting&#xa;• Status codes&#xa;• Security Headers&#xa;• JSON serialization&#xa;• Event logging (audit trail)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#f8d7ff;strokeColor=#9c27b0;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="200" y="460" width="700" height="260" as="geometry"/>
        </mxCell>

        <!-- Layer 5 -->
        <mxCell id="layer5" value="LAYER 5: DATABASE (MySQL)&#xa;Tables: users, exams, questions, submissions, results, exam_events&#xa;• Parameterized queries (SQL injection prevention)&#xa;• Transactions (ACID compliance)&#xa;• Indexes (performance optimization)&#xa;• Row-level security (via application layer)" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6d5;strokeColor=#d35400;fontSize=13;" vertex="1" parent="1">
          <mxGeometry x="200" y="750" width="700" height="110" as="geometry"/>
        </mxCell>

        <!-- Arrows -->
        <mxCell id="a1" style="endArrow=block;" edge="1" parent="1" source="layer1" target="layer2">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="a2" style="endArrow=block;" edge="1" parent="1" source="layer2" target="layer3">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="a3" style="endArrow=block;" edge="1" parent="1" source="layer3" target="layer4">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

        <mxCell id="a4" style="endArrow=block;" edge="1" parent="1" source="layer4" target="layer5">
          <mxGeometry relative="1" as="geometry"/>
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
