package com.forma;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
@RestController @RequestMapping("/api/records")
public class RecordController {
 private final RecordRepository repository;
 private static final Map<String,List<String>> STATUSES=Map.of("customers",List.of("Active","Lead","Inactive"),"deals",List.of("Qualified","Proposal","Negotiation","Won","Lost"),"invoices",List.of("Draft","Sent","Paid","Overdue"),"products",List.of("In stock","Low stock","Out of stock"),"tasks",List.of("To do","In progress","Done"));
 public RecordController(RecordRepository repository){this.repository=repository;}
 @GetMapping public List<BusinessRecord> list(){return repository.findAll();}
 private void validate(BusinessRecord r){if(!STATUSES.getOrDefault(r.type,List.of()).contains(r.status))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid status for this record type");}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public BusinessRecord create(@Valid @RequestBody BusinessRecord r){validate(r);r.id=null;return repository.save(r);}
 @PutMapping("/{id}") public BusinessRecord update(@PathVariable Long id,@Valid @RequestBody BusinessRecord r){BusinessRecord old=repository.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found"));if(!old.type.equals(r.type))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Record type cannot be changed");validate(r);r.id=id;return repository.save(r);}
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable Long id){if(!repository.existsById(id))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found");repository.deleteById(id);}
}
