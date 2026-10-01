package com.forma;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;
@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:test;DB_CLOSE_DELAY=-1","spring.jpa.hibernate.ddl-auto=create-drop"})
@AutoConfigureMockMvc
class RecordApiTest {
 @Autowired MockMvc mvc;
 @Autowired ObjectMapper mapper;
 @Autowired RecordRepository repository;
 BusinessRecord sample(){return new BusinessRecord("customers","Test Customer","Test Co","test@example.com","Lead",100,"2026-10-01","Alex Morgan",0,"Test notes");}
 @Test void seedContainsEveryModule() throws Exception {
  mvc.perform(get("/api/records")).andExpect(status().isOk());
  for(String type:new String[]{"customers","deals","invoices","products","tasks"})assertTrue(repository.findAll().stream().anyMatch(r->type.equals(r.type)));
 }
 @Test void createUpdateDeleteLifecycle() throws Exception {
  String json=mvc.perform(post("/api/records").contentType("application/json").content(mapper.writeValueAsString(sample()))).andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
  BusinessRecord saved=mapper.readValue(json,BusinessRecord.class);assertNotNull(saved.id);assertTrue(repository.existsById(saved.id));
  saved.status="Active";
  mvc.perform(put("/api/records/"+saved.id).contentType("application/json").content(mapper.writeValueAsString(saved))).andExpect(status().isOk()).andExpect(jsonPath("$.status").value("Active"));
  assertEquals("Active",repository.findById(saved.id).orElseThrow().status);
  mvc.perform(delete("/api/records/"+saved.id)).andExpect(status().isNoContent());
  assertFalse(repository.existsById(saved.id));
  mvc.perform(delete("/api/records/"+saved.id)).andExpect(status().isNotFound());
 }
 @Test void rejectsInvalidFieldsAndStatuses() throws Exception {
  BusinessRecord r=sample();r.email="invalid";
  mvc.perform(post("/api/records").contentType("application/json").content(mapper.writeValueAsString(r))).andExpect(status().isBadRequest());
  r=sample();r.status="Paid";
  mvc.perform(post("/api/records").contentType("application/json").content(mapper.writeValueAsString(r))).andExpect(status().isBadRequest());
  r=sample();r.amount=java.math.BigDecimal.valueOf(-1);
  mvc.perform(post("/api/records").contentType("application/json").content(mapper.writeValueAsString(r))).andExpect(status().isBadRequest());
 }
}
