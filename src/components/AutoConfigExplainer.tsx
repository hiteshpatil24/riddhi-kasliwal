import React, { useState } from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Zap, Sparkles, Layers, Code, Check } from 'lucide-react';

export const AutoConfigExplainer: React.FC = () => {
  const [activeStarter, setActiveStarter] = useState<string>('web');

  const starters = [
    {
      id: 'web',
      name: 'spring-boot-starter-web',
      subtitle: 'Embedded Web Server & REST Dispatcher',
      beansAutoConfigured: [
        'Embedded Tomcat WebServer (running on port 8080 without external servlet container)',
        'DispatcherServlet (automatically registered and mapped to "/" url pattern)',
        'Jackson ObjectMapper (automatically serializes/deserializes DTOs to JSON)',
        'Standard HttpMessageConverters (handles application/json, text/plain)',
      ],
      manualAlternative:
        'In traditional Spring, you had to write web.xml, configure DispatcherServlet in XML, download and install standalone Apache Tomcat, compile a WAR file, and manually configure Jackson converters.',
      conditionalAnnotations: [
        '@ConditionalOnClass(Servlet.class)',
        '@ConditionalOnMissingBean(WebMvcConfigurationSupport.class)',
      ],
    },
    {
      id: 'jpa',
      name: 'spring-boot-starter-data-jpa',
      subtitle: 'Database Persistence & In-Memory H2',
      beansAutoConfigured: [
        'HikariDataSource (HikariCP connection pool initialized with default sensible timeouts)',
        'LocalContainerEntityManagerFactory (Hibernate JPA entity manager configured)',
        'JpaTransactionManager (enables declarative @Transactional handling)',
        'JpaRepositoriesAutoConfiguration (implements PatientRepository and AppointmentRepository interfaces on the fly)',
      ],
      manualAlternative:
        'Traditionally required manual DataSource bean definition, JDBC driver class loading, transaction manager XML bean, and writing hundreds of lines of boilerplate DAO queries.',
      conditionalAnnotations: [
        '@ConditionalOnClass({ DataSource.class, EntityManager.class })',
        '@ConditionalOnMissingBean(DataSource.class)',
      ],
    },
    {
      id: 'validation',
      name: 'spring-boot-starter-validation',
      subtitle: 'Jakarta Bean Validation Engine',
      beansAutoConfigured: [
        'LocalValidatorFactoryBean (Hibernate Validator registered as primary validator)',
        'MethodValidationPostProcessor (intercepts @Valid controller method parameters)',
      ],
      manualAlternative:
        'Manual registration of validator factory and custom request interceptors.',
      conditionalAnnotations: [
        '@ConditionalOnClass(ExecutableValidator.class)',
        '@ConditionalOnResource("META-INF/services/jakarta.validation.spi.ValidationProvider")',
      ],
    },
  ];

  const currentStarter = starters.find((s) => s.id === activeStarter) || starters[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
            Constraint #3 & Submission #14
          </span>
          <h2 className="text-lg font-bold text-slate-800">
            Spring Boot Auto-Configuration Mechanism
          </h2>
        </div>
        <p className="mt-1 text-xs text-slate-600">
          How Spring Boot eliminates hundreds of lines of manual boilerplate XML/Java configuration through opinionated starters and conditional bean instantiation.
        </p>
      </div>

      {/* Core Principle Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <Zap className="h-5 w-5" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. @SpringBootApplication</h3>
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Meta-annotation grouping <code className="text-blue-700">@Configuration</code>, <code className="text-blue-700">@EnableAutoConfiguration</code>, and <code className="text-blue-700">@ComponentScan</code>.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600">
            <Cpu className="h-5 w-5" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Classpath Sniffing</h3>
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Spring Boot detects JAR dependencies present on the classpath (e.g. H2 database and Tomcat) and automatically wires their respective beans.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-purple-600">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">3. Non-Invasive Defaults</h3>
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Backed by <code className="text-purple-700">@ConditionalOnMissingBean</code>. If you define your own custom bean, Spring Boot gracefully steps back.
          </p>
        </div>
      </div>

      {/* Interactive Starter Inspector */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Starters in this Project's pom.xml
          </span>
          <span className="text-xs text-slate-500">Select starter to inspect auto-configured beans</span>
        </div>

        {/* Starter Tabs */}
        <div className="mt-4 flex flex-wrap gap-2">
          {starters.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveStarter(s.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition ${
                activeStarter === s.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Starter Detail Box */}
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-800">{currentStarter.name}</h4>
            <span className="text-xs text-blue-700 font-medium">{currentStarter.subtitle}</span>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Automatically Configured Beans:
            </span>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {currentStarter.beansAutoConfigured.map((bean, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{bean}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
            <span className="font-semibold text-red-700">Traditional Manual Effort Avoided:</span>
            <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
              {currentStarter.manualAlternative}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-mono text-slate-600 font-semibold">
              Condition Annotations Under the Hood:
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[11px] text-blue-800">
              {currentStarter.conditionalAnnotations.map((ann, idx) => (
                <span key={idx} className="rounded bg-blue-100 px-2 py-0.5 border border-blue-200">
                  {ann}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table: Traditional vs Spring Boot */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          Traditional Spring Framework vs. Spring Boot Auto-Configuration
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-600 text-[11px]">
              <tr>
                <th className="px-4 py-2.5">Feature</th>
                <th className="px-4 py-2.5 text-red-700 font-semibold">Traditional Spring (Manual Boilerplate)</th>
                <th className="px-4 py-2.5 text-emerald-700 font-semibold">Spring Boot Auto-Configuration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-semibold text-slate-900">Web Server</td>
                <td className="px-4 py-2.5 text-slate-500">External Tomcat installation, web.xml mapping</td>
                <td className="px-4 py-2.5 text-emerald-700 font-medium">Embedded Tomcat auto-started on port 8080</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-semibold text-slate-900">Database / JPA</td>
                <td className="px-4 py-2.5 text-slate-500">Manual DataSource, EntityManagerFactory, TransactionManager beans</td>
                <td className="px-4 py-2.5 text-emerald-700 font-medium">Auto-detects H2 database and configures HikariCP pool</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-semibold text-slate-900">JSON Serialization</td>
                <td className="px-4 py-2.5 text-slate-500">Custom MappingJackson2HttpMessageConverter registered in XML</td>
                <td className="px-4 py-2.5 text-emerald-700 font-medium">Auto-configured Jackson ObjectMapper bean</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-2.5 font-semibold text-slate-900">Packaging</td>
                <td className="px-4 py-2.5 text-slate-500">WAR file deployed to external application container</td>
                <td className="px-4 py-2.5 text-emerald-700 font-medium">Executable standalone Fat JAR with all dependencies inside</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
