package com.forma;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
@Entity
public class BusinessRecord {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @NotBlank @Pattern(regexp="customers|deals|invoices|products|tasks") public String type;
 @NotBlank @Size(max=120) public String name;
 @NotBlank @Size(max=120) public String company;
 @Email @Size(max=160) public String email;
 @NotBlank @Size(max=40) public String status;
 @NotNull @DecimalMin("0.0") @Digits(integer=10,fraction=2) public BigDecimal amount;
 @NotNull public LocalDate date;
 @NotBlank @Size(max=80) public String owner;
 @NotNull @Min(0) public Integer quantity;
 @Size(max=2000) @Column(length=2000) public String notes;
 public BusinessRecord() {}
 public BusinessRecord(String type,String name,String company,String email,String status,double amount,String date,String owner,int quantity,String notes) {
  this.type=type;this.name=name;this.company=company;this.email=email;this.status=status;this.amount=BigDecimal.valueOf(amount);this.date=LocalDate.parse(date);this.owner=owner;this.quantity=quantity;this.notes=notes;
 }
}
