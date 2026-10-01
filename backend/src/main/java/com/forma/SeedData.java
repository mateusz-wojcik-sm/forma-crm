package com.forma;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
@Component
public class SeedData implements CommandLineRunner {
 private final RecordRepository repository;
 public SeedData(RecordRepository repository){this.repository=repository;}
 public void run(String... args){if(repository.count()>0)return;
  add("customers","Olivia Rhye","Layers","olivia@layers.design","Active",48200,"2026-09-28","Alex Morgan",0,"Design systems and digital experiences. Key account.");
  add("customers","Phoenix Baker","Sisyphus","phoenix@sisyphus.com","Active",36500,"2026-09-25","Jamie Lee",0,"Enterprise software partner.");
  add("customers","Lana Steiner","Catalog","lana@catalog.studio","Lead",24000,"2026-09-24","Alex Morgan",0,"Interested in the annual growth package.");
  add("customers","Demi Wilkinson","Circooles","demi@circooles.com","Active",62800,"2026-09-22","Sam Wilson",0,"Quarterly business review due in October.");
  add("customers","Drew Cano","Hourglass","drew@hourglass.io","Active",18700,"2026-09-19","Jamie Lee",0,"Subscription renewal in November.");
  add("customers","Natali Craig","Command+R","natali@commandr.com","Lead",12500,"2026-09-18","Sam Wilson",0,"Discovery meeting scheduled.");
  add("customers","Andi Lane","FocalPoint","andi@focalpoint.app","Inactive",9800,"2026-09-12","Alex Morgan",0,"Follow up next quarter.");
  add("deals","Enterprise platform","Layers","","Negotiation",24500,"2026-10-12","Alex Morgan",0,"Final pricing discussion.");
  add("deals","Brand workspace","Catalog","","Proposal",18000,"2026-10-18","Jamie Lee",0,"Proposal shared with the design team.");
  add("deals","Team expansion","Sisyphus","","Qualified",12800,"2026-10-22","Sam Wilson",0,"Add 40 seats to the workspace.");
  add("deals","Annual renewal","Circooles","","Won",32000,"2026-09-27","Alex Morgan",0,"Signed for another year.");
  add("deals","Analytics suite","Hourglass","","Proposal",9600,"2026-10-25","Jamie Lee",0,"Custom reporting integration.");
  add("deals","Growth package","Command+R","","Qualified",15000,"2026-10-29","Sam Wilson",0,"Discovery completed.");
  add("deals","Studio rollout","FocalPoint","","Negotiation",8400,"2026-10-15","Alex Morgan",0,"Legal review in progress.");
  String[] companies={"Layers","Sisyphus","Catalog","Circooles","Hourglass","Command+R"};
  double[] amounts={18400,24600,21800,31200,28400,38600};
  for(int i=0;i<6;i++)add("invoices","INV-2026-00"+(i+1),companies[i],"","Paid",amounts[i],"2026-0"+(i+4)+"-15","Alex Morgan",0,"Monthly services. USD.");
  add("invoices","INV-2026-007","Layers","","Sent",12400,"2026-10-12","Alex Morgan",0,"Payment due within 30 days.");
  add("invoices","INV-2026-008","Catalog","","Overdue",6800,"2026-09-25","Jamie Lee",0,"Payment reminder required.");
  add("invoices","INV-2026-009","Hourglass","","Draft",4200,"2026-10-20","Sam Wilson",0,"Review before sending.");
  add("products","Workspace Pro","Software","","In stock",79,"2026-10-01","Alex Morgan",240,"Per-seat annual workspace license.");
  add("products","Analytics Plus","Software","","In stock",149,"2026-10-01","Jamie Lee",85,"Advanced reporting add-on.");
  add("products","Studio Desk Kit","Hardware","","Low stock",249,"2026-10-01","Sam Wilson",8,"Desk accessories and docking hub.");
  add("products","Conference Hub","Hardware","","Out of stock",599,"2026-10-01","Sam Wilson",0,"All-in-one meeting room solution.");
  add("tasks","Send proposal to Catalog","Catalog","","To do",0,"2026-10-01","Alex Morgan",0,"Include the annual billing option.");
  add("tasks","Quarterly review with Layers","Layers","","In progress",0,"2026-10-01","Alex Morgan",0,"Prepare usage and growth report.");
  add("tasks","Follow up on overdue invoice","Catalog","","To do",0,"2026-10-02","Jamie Lee",0,"Contact the finance department.");
  add("tasks","Onboard Circooles team","Circooles","","Done",0,"2026-09-30","Sam Wilson",0,"Training and setup completed.");
 }
 private void add(String t,String n,String c,String e,String s,double a,String d,String o,int q,String notes){repository.save(new BusinessRecord(t,n,c,e,s,a,d,o,q,notes));}
}
